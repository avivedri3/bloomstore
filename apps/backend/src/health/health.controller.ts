import { Controller, Get } from '@nestjs/common';
import { ok } from '../common/http';

@Controller('health')
export class HealthController {
  @Get()
  ping() {
    return ok({ status: 'ok', service: 'bloomstore-api' });
  }
}
