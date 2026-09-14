import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog } from '../models/audit-log.schema';

@Injectable()
export class AuditService {
  constructor(@InjectModel(AuditLog.name) private readonly logs: Model<AuditLog>) {}

  async record(
    action: string,
    entity: string,
    actorId?: string,
    entityId?: string,
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    await this.logs.create({
      action,
      entity,
      actorId: actorId ? new Types.ObjectId(actorId) : undefined,
      entityId,
      metadata,
    });
  }
}
