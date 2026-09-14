import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'webhookevents', timestamps: true })
export class WebhookEvent {
  @Prop({ required: true, unique: true })
  eventId!: string;

  @Prop({ required: true })
  type!: string;

  @Prop({ type: Object, required: true })
  payload!: Record<string, unknown>;

  @Prop({ default: 'received' })
  status!: string;
}

export type WebhookEventDocument = HydratedDocument<WebhookEvent>;
export const WebhookEventSchema = SchemaFactory.createForClass(WebhookEvent);
