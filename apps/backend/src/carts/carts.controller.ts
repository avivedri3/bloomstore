import { Body, Controller, Delete, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtPayload } from '../auth/jwt.strategy';
import { TokenVersionGuard } from '../auth/token-version.guard';
import { ok } from '../common/http';
import { ApiAuth, ApiEnvelopeOk } from '../common/swagger';
import { CartsService } from './carts.service';

@ApiTags('cart')
@ApiAuth()
@Controller('cart')
@UseGuards(AuthGuard('jwt'), TokenVersionGuard)
export class CartsController {
  constructor(private readonly carts: CartsService) {}

  @Get()
  @ApiOperation({ summary: 'Get cart' })
  @ApiEnvelopeOk()
  async get(@Req() req: { user: JwtPayload }) {
    return ok(await this.carts.get(req.user.sub));
  }

  @Put('items')
  @ApiOperation({ summary: 'Add or update cart line' })
  @ApiEnvelopeOk()
  async upsert(@Req() req: { user: JwtPayload }, @Body() body: unknown) {
    return ok(await this.carts.upsertItem(req.user.sub, body));
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: 'Remove cart line' })
  @ApiEnvelopeOk()
  async remove(@Req() req: { user: JwtPayload }, @Param('productId') productId: string) {
    return ok(await this.carts.removeItem(req.user.sub, productId));
  }
}
