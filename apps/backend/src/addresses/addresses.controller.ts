import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload } from '../auth/jwt.strategy';
import { TokenVersionGuard } from '../auth/token-version.guard';
import { ok } from '../common/http';
import { AddressesService } from './addresses.service';

@Controller('addresses')
@UseGuards(AuthGuard('jwt'), TokenVersionGuard)
export class AddressesController {
  constructor(private readonly addresses: AddressesService) {}

  @Get()
  async list(@Req() req: { user: JwtPayload }) {
    return ok(await this.addresses.list(req.user.sub));
  }

  @Post()
  async create(@Req() req: { user: JwtPayload }, @Body() body: unknown) {
    return ok(await this.addresses.create(req.user.sub, body));
  }
}
