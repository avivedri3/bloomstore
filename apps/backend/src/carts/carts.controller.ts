import { Body, Controller, Delete, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload } from '../auth/jwt.strategy';
import { TokenVersionGuard } from '../auth/token-version.guard';
import { ok } from '../common/http';
import { CartsService } from './carts.service';

@Controller('cart')
@UseGuards(AuthGuard('jwt'), TokenVersionGuard)
export class CartsController {
  constructor(private readonly carts: CartsService) {}

  @Get()
  async get(@Req() req: { user: JwtPayload }) {
    return ok(await this.carts.get(req.user.sub));
  }

  @Put('items')
  async upsert(@Req() req: { user: JwtPayload }, @Body() body: unknown) {
    return ok(await this.carts.upsertItem(req.user.sub, body));
  }

  @Delete('items/:productId')
  async remove(@Req() req: { user: JwtPayload }, @Param('productId') productId: string) {
    return ok(await this.carts.removeItem(req.user.sub, productId));
  }
}
