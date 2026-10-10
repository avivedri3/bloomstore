import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/admin.guard';
import { TokenVersionGuard } from '../auth/token-version.guard';
import { ok } from '../common/http';
import { ApiAuth, ApiEnvelopeOk } from '../common/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller()
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Post('traffic')
  @HttpCode(200)
  @ApiOperation({ summary: 'Record a storefront page view' })
  @ApiEnvelopeOk()
  async traffic(@Body() body: unknown) {
    return ok(await this.analytics.recordPageView(body));
  }

  @Get('admin/stats')
  @ApiAuth()
  @UseGuards(AuthGuard('jwt'), TokenVersionGuard, AdminGuard)
  @ApiOperation({ summary: 'Admin dashboard statistics' })
  @ApiEnvelopeOk()
  async stats() {
    return ok(await this.analytics.dashboard());
  }
}
