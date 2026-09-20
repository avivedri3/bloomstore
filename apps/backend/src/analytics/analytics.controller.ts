import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/admin.guard';
import { TokenVersionGuard } from '../auth/token-version.guard';
import { ok } from '../common/http';
import { ApiAuth, ApiEnvelopeOk } from '../common/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('admin')
@ApiAuth()
@Controller('admin/stats')
@UseGuards(AuthGuard('jwt'), TokenVersionGuard, AdminGuard)
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get()
  @ApiOperation({ summary: 'Admin dashboard statistics' })
  @ApiEnvelopeOk()
  async stats() {
    return ok(await this.analytics.dashboard());
  }
}
