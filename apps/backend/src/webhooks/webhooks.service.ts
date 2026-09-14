import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FailedWebhook } from '../models/failed-webhook.schema';
import { WebhookEvent } from '../models/webhook-event.schema';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectModel(WebhookEvent.name) private readonly events: Model<WebhookEvent>,
    @InjectModel(FailedWebhook.name) private readonly failed: Model<FailedWebhook>,
    private readonly audit: AuditService,
  ) {}

  async ingest(eventId: string, type: string, payload: Record<string, unknown>) {
    try {
      const existing = await this.events.findOne({ eventId });
      if (existing) {
        return existing;
      }
      const saved = await this.events.create({ eventId, type, payload, status: 'processed' });
      await this.audit.record('webhook.ingest', 'webhookevents', undefined, eventId, { type });
      return saved;
    } catch (error) {
      await this.failed.create({
        eventId,
        type,
        payload,
        reason: error instanceof Error ? error.message : 'unknown',
      });
      throw error;
    }
  }
}
