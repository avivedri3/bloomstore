import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ProductDto, StockAlertDto, productInputSchema, stockAlertSchema } from '@bloomstore/shared-types';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../models/product.schema';
import { AuditService } from '../audit/audit.service';
import { MailService } from '../mail/mail.service';

const MAX_STOCK_ALERTS = 100;

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly products: Model<Product>,
    private readonly audit: AuditService,
    private readonly mail: MailService,
  ) {}

  async listPublic(category?: string): Promise<ProductDto[]> {
    const filter: Record<string, unknown> = { isActive: true };
    if (category) {
      filter.category = category;
    }
    const rows = await this.products.find(filter).sort({ name: 1 });
    return rows
      .sort((a, b) => {
        const aOut = a.stock === 0 ? 1 : 0;
        const bOut = b.stock === 0 ? 1 : 0;
        if (aOut !== bOut) {
          return aOut - bOut;
        }
        return a.name.localeCompare(b.name);
      })
      .map((p) => this.toDto(p));
  }

  async listAdmin(): Promise<ProductDto[]> {
    const rows = await this.products.find().sort({ name: 1 });
    return rows.map((p) => this.toDto(p));
  }

  async getPublic(id: string): Promise<ProductDto> {
    const product = await this.products.findOne({ _id: id, isActive: true });
    if (!product) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Product not available' });
    }
    return this.toDto(product);
  }

  async create(input: unknown, actorId: string): Promise<ProductDto> {
    const dto = productInputSchema.parse(input);
    const product = await this.products.create(dto);
    await this.audit.record('product.create', 'products', actorId, String(product._id));
    return this.toDto(product);
  }

  async update(id: string, input: unknown, actorId: string): Promise<ProductDto> {
    const dto = productInputSchema.partial().parse(input);
    const previous = await this.products.findById(id);
    if (!previous) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Product not found' });
    }
    const product = await this.products.findByIdAndUpdate(id, dto, { new: true });
    if (!product) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Product not found' });
    }
    await this.audit.record('product.update', 'products', actorId, id);
    if (previous.stock === 0 && product.stock > 0) {
      await this.notifyBackInStock([id]);
    }
    return this.toDto(product);
  }

  async softDelete(id: string, actorId: string): Promise<void> {
    await this.products.findByIdAndUpdate(id, { isActive: false });
    await this.audit.record('product.softDelete', 'products', actorId, id);
  }

  async subscribeStockAlert(id: string, input: unknown): Promise<StockAlertDto> {
    const { email } = stockAlertSchema.parse(input);
    const normalized = email.toLowerCase();
    const product = await this.products.findOne({ _id: id, isActive: true });
    if (!product) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Product not available' });
    }
    if (product.stock > 0) {
      throw new BadRequestException({
        code: 'IN_STOCK',
        message: 'This bouquet is already available',
      });
    }
    const existing = (product.stockNotifyEmails ?? []).map((value) => value.toLowerCase());
    if (existing.includes(normalized)) {
      return { subscribed: true, alreadySubscribed: true };
    }
    if (existing.length >= MAX_STOCK_ALERTS) {
      throw new BadRequestException({
        code: 'WAITLIST_FULL',
        message: 'This waitlist is full — please try again later',
      });
    }
    await this.products.updateOne({ _id: id }, { $addToSet: { stockNotifyEmails: normalized } });
    await this.audit.record('product.stockAlert.subscribe', 'products', undefined, id);
    return { subscribed: true, alreadySubscribed: false };
  }

  async notifyBackInStock(productIds: string[]): Promise<void> {
    const unique = [...new Set(productIds.filter(Boolean))];
    for (const id of unique) {
      const product = await this.products.findById(id);
      if (!product || product.stock <= 0) {
        continue;
      }
      const emails = [...new Set((product.stockNotifyEmails ?? []).map((value) => value.toLowerCase()))];
      if (emails.length === 0) {
        continue;
      }
      await this.products.updateOne({ _id: id }, { $set: { stockNotifyEmails: [] } });
      for (const to of emails) {
        try {
          await this.mail.sendBackInStock(to, { id, name: product.name });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'send failed';
          await this.audit.record('product.stockAlert.failed', 'products', undefined, id, {
            to,
            message,
          });
        }
      }
      await this.audit.record('product.stockAlert.sent', 'products', undefined, id, {
        count: emails.length,
      });
    }
  }

  toDto(product: ProductDocument): ProductDto {
    return {
      id: String(product._id),
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      isActive: product.isActive,
    };
  }
}
