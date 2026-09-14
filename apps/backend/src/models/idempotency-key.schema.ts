import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ collection: 'idempotencykeys', timestamps: true })
export class IdempotencyKey {
  @Prop({ required: true, unique: true })
  key!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order' })
  orderId?: Types.ObjectId;

  @Prop({ type: Object })
  response?: Record<string, unknown>;
}

export type IdempotencyKeyDocument = HydratedDocument<IdempotencyKey>;
export const IdempotencyKeySchema = SchemaFactory.createForClass(IdempotencyKey);
IdempotencyKeySchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });
