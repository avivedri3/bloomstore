import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'failedwebhooks', timestamps: true })
export class FailedWebhook {
  @Prop({ required: true })
  eventId!: string;

  @Prop({ required: true })
  type!: string;

  @Prop({ type: Object, required: true })
  payload!: Record<string, unknown>;

  @Prop({ required: true })
  reason!: string;

  @Prop({ default: 0 })
  retryCount!: number;
}

export type FailedWebhookDocument = HydratedDocument<FailedWebhook>;
export const FailedWebhookSchema = SchemaFactory.createForClass(FailedWebhook);
