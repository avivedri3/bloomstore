import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import {
  OrderDto,
  OrderStatus,
  canTransition,
  checkoutSchema,
  orderStatusUpdateSchema,
} from '@bloomstore/shared-types';
import { Connection, Model, Types } from 'mongoose';
import { AddressesService } from '../addresses/addresses.service';
import { AuditService } from '../audit/audit.service';
import { CartsService } from '../carts/carts.service';
import { Cart } from '../models/cart.schema';
import { IdempotencyKey } from '../models/idempotency-key.schema';
import { Order } from '../models/order.schema';
import { Payment } from '../models/payment.schema';
import { Product } from '../models/product.schema';
import { SequencesService } from '../sequences/sequences.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orders: Model<Order>,
    @InjectModel(Product.name) private readonly products: Model<Product>,
    @InjectModel(Cart.name) private readonly carts: Model<Cart>,
    @InjectModel(Payment.name) private readonly payments: Model<Payment>,
    @InjectModel(IdempotencyKey.name) private readonly keys: Model<IdempotencyKey>,
    @InjectConnection() private readonly connection: Connection,
    private readonly sequences: SequencesService,
    private readonly cartsService: CartsService,
    private readonly addresses: AddressesService,
    private readonly audit: AuditService,
  ) {}

  async checkout(userId: string, input: unknown): Promise<OrderDto> {
    const { addressId, idempotencyKey } = checkoutSchema.parse(input);
    const existing = await this.keys.findOne({ key: idempotencyKey, userId: new Types.ObjectId(userId) });
    if (existing?.orderId) {
      const replay = await this.orders.findById(existing.orderId);
      if (replay) {
        return this.toDto(replay);
      }
    }
    await this.addresses.ensureOwned(userId, addressId);
    const cart = await this.cartsService.get(userId);
    if (cart.items.length === 0) {
      throw new BadRequestException({ code: 'CART_EMPTY', message: 'Cart is empty' });
    }

    const session = await this.connection.startSession();
    try {
      let created!: Order & { id: string };
      await session.withTransaction(async () => {
        const snapshots = [];
        let total = 0;
        for (const item of cart.items) {
          const product = await this.products
            .findOneAndUpdate(
              { _id: item.productId, isActive: true, stock: { $gte: item.quantity } },
              { $inc: { stock: -item.quantity } },
              { new: true, session },
            );
          if (!product) {
            throw new BadRequestException({
              code: 'OUT_OF_STOCK',
              message: `Insufficient stock for ${item.name}`,
            });
          }
          snapshots.push({
            productId: product._id,
            name: product.name,
            imageUrl: product.imageUrl,
            unitPrice: product.price,
            quantity: item.quantity,
          });
          total += product.price * item.quantity;
        }
        const seq = await this.sequences.next('orders');
        const [order] = await this.orders.create(
          [
            {
              orderNumber: `BLM-${seq}`,
              userId: new Types.ObjectId(userId),
              status: 'pending_payment',
              items: snapshots,
              total,
              addressId: new Types.ObjectId(addressId),
            },
          ],
          { session },
        );
        await this.payments.create(
          [
            {
              orderId: order._id,
              userId: new Types.ObjectId(userId),
              amount: total,
              status: 'pending',
              provider: 'simulated',
            },
          ],
          { session },
        );
        await this.carts.updateOne(
          { userId: new Types.ObjectId(userId) },
          { $set: { items: [] } },
          { session },
        );
        created = order as Order & { id: string };
      });
      await this.cartsService.clear(userId);
      await this.keys.create({
        key: idempotencyKey,
        userId: new Types.ObjectId(userId),
        orderId: created._id,
      });
      await this.audit.record('order.create', 'orders', userId, created.id, {
        orderNumber: created.orderNumber,
      });
      return this.toDto(created);
    } finally {
      await session.endSession();
    }
  }

  async listMine(userId: string): Promise<OrderDto[]> {
    const rows = await this.orders.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 });
    return rows.map((o) => this.toDto(o));
  }

  async listAdmin(status?: OrderStatus): Promise<OrderDto[]> {
    const filter = status ? { status } : {};
    const rows = await this.orders.find(filter).sort({ createdAt: -1 });
    return rows.map((o) => this.toDto(o));
  }

  async getOne(id: string, userId?: string, admin = false): Promise<OrderDto> {
    const order = await this.orders.findById(id);
    if (!order) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Order not found' });
    }
    if (!admin && order.userId.toString() !== userId) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Order not found' });
    }
    return this.toDto(order);
  }

  async updateStatus(id: string, input: unknown, actorId: string): Promise<OrderDto> {
    const { status } = orderStatusUpdateSchema.parse(input);
    const order = await this.orders.findById(id);
    if (!order) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Order not found' });
    }
    if (!canTransition(order.status, status)) {
      throw new BadRequestException({
        code: 'ILLEGAL_TRANSITION',
        message: `Cannot move from ${order.status} to ${status}`,
      });
    }
    if (status === 'cancelled') {
      await this.cancelAndRestock(order);
    } else {
      if (status === 'confirmed') {
        await this.payments.updateOne({ orderId: order._id }, { status: 'captured' });
      }
      order.status = status;
      await order.save();
    }
    await this.audit.record('order.status', 'orders', actorId, id, { status });
    return this.toDto(order);
  }

  async cancelMine(id: string, userId: string): Promise<OrderDto> {
    return this.updateStatus(id, { status: 'cancelled' }, userId);
  }

  private async cancelAndRestock(order: Order & { id: string }): Promise<void> {
    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      throw new BadRequestException({
        code: 'ILLEGAL_TRANSITION',
        message: 'Cannot restock after shipping',
      });
    }
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        for (const item of order.items) {
          await this.products.updateOne(
            { _id: item.productId },
            { $inc: { stock: item.quantity } },
            { session },
          );
        }
        await this.orders.updateOne(
          { _id: order._id },
          { $set: { status: 'cancelled' } },
          { session },
        );
        await this.payments.updateOne({ orderId: order._id }, { $set: { status: 'refunded' } }, { session });
      });
      order.status = 'cancelled';
    } finally {
      await session.endSession();
    }
  }

  toDto(order: Order & { id: string; createdAt?: Date; updatedAt?: Date }): OrderDto {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId.toString(),
      status: order.status,
      items: order.items.map((i) => ({
        productId: i.productId.toString(),
        name: i.name,
        imageUrl: i.imageUrl,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
      })),
      total: order.total,
      addressId: order.addressId.toString(),
      createdAt: (order as { createdAt?: Date }).createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: (order as { updatedAt?: Date }).updatedAt?.toISOString() ?? new Date().toISOString(),
    };
  }
}
