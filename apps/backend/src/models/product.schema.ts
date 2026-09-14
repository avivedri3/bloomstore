import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PRODUCT_CATEGORIES, ProductCategory } from '@bloomstore/shared-types';

@Schema({ collection: 'products', timestamps: true })
export class Product {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ type: String, enum: PRODUCT_CATEGORIES, required: true })
  category!: ProductCategory;

  @Prop({ required: true })
  price!: number;

  @Prop({ required: true, default: 0 })
  stock!: number;

  @Prop({ required: true })
  imageUrl!: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export type ProductDocument = HydratedDocument<Product>;
export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ isActive: 1, stock: 1, category: 1 });
