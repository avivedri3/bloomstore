import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ORDER_STATUSES, OrderStatus } from '@bloomstore/shared-types';

@Schema({ _id: false })
export class OrderItemSnapshot {
  @Prop({ type: Types.ObjectId, required: true })
  productId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  imageUrl!: string;

  @Prop({ required: true })
  unitPrice!: number;

  @Prop({ required: true })
  quantity!: number;
}

@Schema({ collection: 'orders', timestamps: true })
export class Order {
  @Prop({ required: true, unique: true })
  orderNumber!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, enum: ORDER_STATUSES, default: 'pending_payment', index: true })
  status!: OrderStatus;

  @Prop({ type: [OrderItemSnapshot], required: true })
  items!: OrderItemSnapshot[];

  @Prop({ required: true })
  total!: number;

  @Prop({ type: Types.ObjectId, ref: 'Address', required: true })
  addressId!: Types.ObjectId;
}

export type OrderDocument = HydratedDocument<Order>;
export const OrderSchema = SchemaFactory.createForClass(Order);
