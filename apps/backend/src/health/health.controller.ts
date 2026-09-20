import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiEnvelopeOk } from '../common/swagger';
import { ok } from '../common/http';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiEnvelopeOk()
  ping() {
    return ok({ status: 'ok', service: 'bloomstore-api' });
  }
}
