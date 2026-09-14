import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrderStatus } from '@bloomstore/shared-types';
import { AdminGuard } from '../auth/admin.guard';
import { JwtPayload } from '../auth/jwt.strategy';
import { TokenVersionGuard } from '../auth/token-version.guard';
import { ok } from '../common/http';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(AuthGuard('jwt'), TokenVersionGuard)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post('checkout')
  async checkout(@Req() req: { user: JwtPayload }, @Body() body: unknown) {
    return ok(await this.orders.checkout(req.user.sub, body));
  }

  @Get('mine')
  async mine(@Req() req: { user: JwtPayload }) {
    return ok(await this.orders.listMine(req.user.sub));
  }

  @Get('admin')
  @UseGuards(AdminGuard)
  async admin(@Query('status') status?: OrderStatus) {
    return ok(await this.orders.listAdmin(status));
  }

  @Get(':id')
  async one(@Param('id') id: string, @Req() req: { user: JwtPayload }) {
    return ok(await this.orders.getOne(id, req.user.sub, req.user.role === 'admin'));
  }

  @Patch(':id/status')
  @UseGuards(AdminGuard)
  async status(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() req: { user: JwtPayload },
  ) {
    return ok(await this.orders.updateStatus(id, body, req.user.sub));
  }

  @Post(':id/cancel')
  async cancel(@Param('id') id: string, @Req() req: { user: JwtPayload }) {
    if (req.user.role === 'admin') {
      return ok(await this.orders.updateStatus(id, { status: 'cancelled' }, req.user.sub));
    }
    return ok(await this.orders.cancelMine(id, req.user.sub));
  }
}
