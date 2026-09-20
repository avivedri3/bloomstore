import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ok } from '../common/http';
import { ApiEnvelopeOk } from '../common/swagger';
import { WebhooksService } from './webhooks.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooks: WebhooksService) {}

  @Post('payments')
  @ApiOperation({ summary: 'Ingest payment webhook (idempotent)' })
  @ApiBody({
    schema: {
      example: { eventId: 'evt_123', type: 'payment.captured', payload: { orderId: '...' } },
    },
  })
  @ApiEnvelopeOk()
  async payments(
    @Body() body: { eventId: string; type: string; payload: Record<string, unknown> },
  ) {
    const event = await this.webhooks.ingest(body.eventId, body.type, body.payload ?? {});
    return ok({ id: event.id, status: event.status });
  }
}
