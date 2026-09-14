import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { loginSchema, registerSchema } from '@bloomstore/shared-types';
import { ok } from '../common/http';
import { TokenVersionGuard } from './token-version.guard';
import { AuthService } from './auth.service';
import { JwtPayload } from './jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  async register(@Body() body: unknown) {
    const dto = registerSchema.parse(body);
    return ok(await this.auth.register(dto.email, dto.password, dto.fullName));
  }

  @Post('login')
  async login(@Body() body: unknown) {
    const dto = loginSchema.parse(body);
    return ok(await this.auth.login(dto.email, dto.password));
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'), TokenVersionGuard)
  async logout(@Req() req: { user: JwtPayload }) {
    await this.auth.logout(req.user.sub);
    return ok({ loggedOut: true });
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'), TokenVersionGuard)
  async me(@Req() req: { user: JwtPayload }) {
    return ok(await this.auth.me(req.user.sub));
  }
}
