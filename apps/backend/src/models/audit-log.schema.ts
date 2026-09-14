import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ collection: 'auditlogs', timestamps: true })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  actorId?: Types.ObjectId;

  @Prop({ required: true })
  action!: string;

  @Prop({ required: true })
  entity!: string;

  @Prop()
  entityId?: string;

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, unknown>;
}

export type AuditLogDocument = HydratedDocument<AuditLog>;
export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
