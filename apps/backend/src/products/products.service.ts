import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ProductDto, StockAlertDto, productInputSchema, stockAlertSchema } from '@bloomstore/shared-types';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../models/product.schema';
import { AuditService } from '../audit/audit.service';
import { MailService } from '../mail/mail.service';
import {
  publicProductImageUrl,
  removeProductImage,
  saveProductImage,
  uploadedProductFilename,
  type UploadedProductImage,
} from './product-image';

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

  async create(
    input: unknown,
    image: UploadedProductImage | undefined,
    publicOrigin: string,
    actorId: string,
  ): Promise<ProductDto> {
    const filename = await saveProductImage(image);
    const imageUrl = publicProductImageUrl(publicOrigin, filename);
    try {
      const dto = productInputSchema.parse(this.withImageUrl(input, imageUrl));
      const product = await this.products.create(dto);
      await this.audit.record('product.create', 'products', actorId, String(product._id));
      return this.toDto(product);
    } catch (error) {
      await removeProductImage(filename);
      throw error;
    }
  }

  async update(
    id: string,
    input: unknown,
    actorId: string,
    image?: UploadedProductImage,
    publicOrigin?: string,
  ): Promise<ProductDto> {
    const previous = await this.products.findById(id);
    if (!previous) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Product not found' });
    }
    const replacement = image?.buffer?.length ? await saveProductImage(image) : undefined;
    try {
      const imageUrl = replacement
        ? publicProductImageUrl(publicOrigin ?? '', replacement)
        : undefined;
      const dto = productInputSchema.partial().parse(this.normalizeUpdate(input, imageUrl));
      const product = await this.products.findByIdAndUpdate(id, dto, { new: true });
      if (!product) {
        throw new NotFoundException({ code: 'NOT_FOUND', message: 'Product not found' });
      }
      await this.audit.record('product.update', 'products', actorId, id);
      if (replacement) {
        const previousFile = uploadedProductFilename(previous.imageUrl);
        if (previousFile && previousFile !== replacement) {
          const keptByOrder = await this.products.db
            .collection('orders')
            .countDocuments({ 'items.imageUrl': previous.imageUrl });
          if (keptByOrder === 0) {
            await removeProductImage(previousFile);
          }
        }
      }
      if (previous.stock === 0 && product.stock > 0) {
        await this.notifyBackInStock([id]);
      }
      return this.toDto(product);
    } catch (error) {
      if (replacement) {
        await removeProductImage(replacement);
      }
      throw error;
    }
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

  private normalizeUpdate(input: unknown, imageUrl?: string) {
    const body = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
    const next: Record<string, unknown> = {};
    if (typeof body.name === 'string') next.name = body.name;
    if (typeof body.description === 'string') next.description = body.description;
    if (typeof body.category === 'string') next.category = body.category;
    if (body.price !== undefined && body.price !== '') {
      next.price = typeof body.price === 'number' ? body.price : Number(body.price);
    }
    if (body.stock !== undefined && body.stock !== '') {
      next.stock = typeof body.stock === 'number' ? body.stock : Number(body.stock);
    }
    if (imageUrl) {
      next.imageUrl = imageUrl;
    } else if (typeof body.imageUrl === 'string' && body.imageUrl) {
      next.imageUrl = body.imageUrl;
    }
    if (body.isActive === true || body.isActive === 'true') next.isActive = true;
    if (body.isActive === false || body.isActive === 'false') next.isActive = false;
    return next;
  }

  private withImageUrl(input: unknown, imageUrl: string) {
    const body = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
    const isActive =
      body.isActive === undefined || body.isActive === ''
        ? undefined
        : body.isActive === true || body.isActive === 'true';
    return {
      name: body.name,
      description: body.description,
      category: body.category,
      price: typeof body.price === 'number' ? body.price : Number(body.price),
      stock: typeof body.stock === 'number' ? body.stock : Number(body.stock),
      imageUrl,
      ...(isActive === undefined ? {} : { isActive }),
    };
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
