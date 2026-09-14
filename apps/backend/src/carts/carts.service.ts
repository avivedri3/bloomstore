import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CartDto, cartItemInputSchema } from '@bloomstore/shared-types';
import { Model, Types } from 'mongoose';
import { CacheService } from '../cache/cache.service';
import { Cart } from '../models/cart.schema';
import { Product } from '../models/product.schema';

@Injectable()
export class CartsService {
  constructor(
    @InjectModel(Cart.name) private readonly carts: Model<Cart>,
    @InjectModel(Product.name) private readonly products: Model<Product>,
    private readonly cache: CacheService,
  ) {}

  private cacheKey(userId: string) {
    return `cart:${userId}`;
  }

  async get(userId: string): Promise<CartDto> {
    const cached = await this.cache.get(this.cacheKey(userId));
    if (cached) {
      return JSON.parse(cached) as CartDto;
    }
    const dto = await this.load(userId);
    await this.cache.set(this.cacheKey(userId), JSON.stringify(dto));
    return dto;
  }

  async upsertItem(userId: string, input: unknown): Promise<CartDto> {
    const { productId, quantity } = cartItemInputSchema.parse(input);
    const product = await this.products.findOne({
      _id: productId,
      isActive: true,
      stock: { $gt: 0 },
    });
    if (!product) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Product not available' });
    }
    if (quantity > product.stock) {
      throw new BadRequestException({ code: 'OUT_OF_STOCK', message: 'Not enough stock' });
    }
    const cart = await this.carts.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $setOnInsert: { userId: new Types.ObjectId(userId), items: [] } },
      { upsert: true, new: true },
    );
    const idx = cart.items.findIndex((i) => i.productId.toString() === productId);
    if (idx >= 0) {
      cart.items[idx].quantity = quantity;
    } else {
      cart.items.push({ productId: new Types.ObjectId(productId), quantity });
    }
    await cart.save();
    return this.writeThrough(userId);
  }

  async removeItem(userId: string, productId: string): Promise<CartDto> {
    await this.carts.updateOne(
      { userId: new Types.ObjectId(userId) },
      { $pull: { items: { productId: new Types.ObjectId(productId) } } },
    );
    return this.writeThrough(userId);
  }

  async clear(userId: string): Promise<void> {
    await this.carts.updateOne({ userId: new Types.ObjectId(userId) }, { $set: { items: [] } });
    await this.cache.del(this.cacheKey(userId));
  }

  private async writeThrough(userId: string): Promise<CartDto> {
    const dto = await this.load(userId);
    await this.cache.set(this.cacheKey(userId), JSON.stringify(dto));
    return dto;
  }

  private async load(userId: string): Promise<CartDto> {
    const cart = await this.carts.findOne({ userId: new Types.ObjectId(userId) });
    if (!cart) {
      return { id: '', userId, items: [], subtotal: 0 };
    }
    const ids = cart.items.map((i) => i.productId);
    const products = await this.products.find({ _id: { $in: ids } });
    const byId = new Map(products.map((p) => [p.id, p]));
    const items = cart.items
      .map((item) => {
        const product = byId.get(item.productId.toString());
        if (!product || !product.isActive || product.stock === 0) {
          return null;
        }
        return {
          productId: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          unitPrice: product.price,
          quantity: item.quantity,
        };
      })
      .filter((i): i is NonNullable<typeof i> => i !== null);
    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    return { id: cart.id, userId, items, subtotal };
  }
}
