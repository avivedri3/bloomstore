import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { OrderStatus } from '@bloomstore/shared-types';
import { AdminGuard } from '../auth/admin.guard';
import { JwtPayload } from '../auth/jwt.strategy';
import { TokenVersionGuard } from '../auth/token-version.guard';
import { ok } from '../common/http';
import { ApiAuth, ApiEnvelopeOk } from '../common/swagger';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@ApiAuth()
@Controller('orders')
@UseGuards(AuthGuard('jwt'), TokenVersionGuard)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Checkout cart into order' })
  @ApiEnvelopeOk()
  async checkout(@Req() req: { user: JwtPayload }, @Body() body: unknown) {
    return ok(await this.orders.checkout(req.user.sub, body));
  }

  @Get('mine')
  @ApiOperation({ summary: 'List my orders' })
  @ApiEnvelopeOk()
  async mine(@Req() req: { user: JwtPayload }) {
    return ok(await this.orders.listMine(req.user.sub));
  }

  @Get('admin')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Admin: list orders' })
  @ApiQuery({ name: 'status', required: false })
  @ApiEnvelopeOk()
  async admin(@Query('status') status?: OrderStatus) {
    return ok(await this.orders.listAdmin(status));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Order detail (owner or admin)' })
  @ApiEnvelopeOk()
  async one(@Param('id') id: string, @Req() req: { user: JwtPayload }) {
    return ok(await this.orders.getOne(id, req.user.sub, req.user.role === 'admin'));
  }

  @Patch(':id/status')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Admin: update order status' })
  @ApiEnvelopeOk()
  async status(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() req: { user: JwtPayload },
  ) {
    return ok(await this.orders.updateStatus(id, body, req.user.sub));
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel order (customer or admin)' })
  @ApiEnvelopeOk()
  async cancel(@Param('id') id: string, @Req() req: { user: JwtPayload }) {
    if (req.user.role === 'admin') {
      return ok(await this.orders.updateStatus(id, { status: 'cancelled' }, req.user.sub));
    }
    return ok(await this.orders.cancelMine(id, req.user.sub));
  }
}
