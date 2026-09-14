import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ _id: false })
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId!: Types.ObjectId;

  @Prop({ required: true })
  quantity!: number;
}

@Schema({ collection: 'carts', timestamps: true })
export class Cart {
  @Prop({ type: Types.ObjectId, ref: 'User', unique: true, required: true })
  userId!: Types.ObjectId;

  @Prop({ type: [CartItem], default: [] })
  items!: CartItem[];
}

export type CartDocument = HydratedDocument<Cart>;
export const CartSchema = SchemaFactory.createForClass(Cart);
