import { Body, Controller, Post } from '@nestjs/common';
import { ok } from '../common/http';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooks: WebhooksService) {}

  @Post('payments')
  async payments(
    @Body() body: { eventId: string; type: string; payload: Record<string, unknown> },
  ) {
    const event = await this.webhooks.ingest(body.eventId, body.type, body.payload ?? {});
    return ok({ id: event.id, status: event.status });
  }
}
