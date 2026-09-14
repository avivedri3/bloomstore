import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PAYMENT_STATUSES, PaymentStatus } from '@bloomstore/shared-types';

@Schema({ collection: 'payments', timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true, unique: true })
  orderId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  amount!: number;

  @Prop({ type: String, enum: PAYMENT_STATUSES, default: 'pending' })
  status!: PaymentStatus;

  @Prop({ default: 'simulated' })
  provider!: string;

  @Prop()
  providerRef?: string;
}

export type PaymentDocument = HydratedDocument<Payment>;
export const PaymentSchema = SchemaFactory.createForClass(Payment);
