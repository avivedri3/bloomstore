import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ProductDto, productInputSchema } from '@bloomstore/shared-types';
import { Model } from 'mongoose';
import { Product } from '../models/product.schema';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly products: Model<Product>,
    private readonly audit: AuditService,
  ) {}

  async listPublic(category?: string): Promise<ProductDto[]> {
    const filter: Record<string, unknown> = { isActive: true, stock: { $gt: 0 } };
    if (category) {
      filter.category = category;
    }
    const rows = await this.products.find(filter).sort({ name: 1 });
    return rows.map((p) => this.toDto(p));
  }

  async listAdmin(): Promise<ProductDto[]> {
    const rows = await this.products.find().sort({ name: 1 });
    return rows.map((p) => this.toDto(p));
  }

  async getPublic(id: string): Promise<ProductDto> {
    const product = await this.products.findOne({ _id: id, isActive: true, stock: { $gt: 0 } });
    if (!product) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Product not available' });
    }
    return this.toDto(product);
  }

  async create(input: unknown, actorId: string): Promise<ProductDto> {
    const dto = productInputSchema.parse(input);
    const product = await this.products.create(dto);
    await this.audit.record('product.create', 'products', actorId, product.id);
    return this.toDto(product);
  }

  async update(id: string, input: unknown, actorId: string): Promise<ProductDto> {
    const dto = productInputSchema.partial().parse(input);
    const product = await this.products.findByIdAndUpdate(id, dto, { new: true });
    if (!product) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Product not found' });
    }
    await this.audit.record('product.update', 'products', actorId, id);
    return this.toDto(product);
  }

  async softDelete(id: string, actorId: string): Promise<void> {
    await this.products.findByIdAndUpdate(id, { isActive: false });
    await this.audit.record('product.softDelete', 'products', actorId, id);
  }

  toDto(product: Product & { id: string }): ProductDto {
    return {
      id: product.id,
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
