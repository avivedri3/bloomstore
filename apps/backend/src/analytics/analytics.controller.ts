import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard';
import { TokenVersionGuard } from '../auth/token-version.guard';
import { ok } from '../common/http';
import { AnalyticsService } from './analytics.service';

@Controller('admin/stats')
@UseGuards(AuthGuard('jwt'), TokenVersionGuard, AdminGuard)
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get()
  async stats() {
    return ok(await this.analytics.dashboard());
  }
}
