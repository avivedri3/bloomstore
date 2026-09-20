import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { loginSchema, registerSchema } from '@bloomstore/shared-types';
import { ok } from '../common/http';
import { ApiAuth, ApiEnvelopeErrors, ApiEnvelopeOk } from '../common/swagger';
import { TokenVersionGuard } from './token-version.guard';
import { AuthService } from './auth.service';
import { JwtPayload } from './jwt.strategy';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new customer' })
  @ApiBody({
    schema: {
      example: { email: 'user@example.com', password: 'SecurePass123!', fullName: 'Jane Doe' },
    },
  })
  @ApiEnvelopeOk('User and access token')
  @ApiEnvelopeErrors()
  async register(@Body() body: unknown) {
    const dto = registerSchema.parse(body);
    return ok(await this.auth.register(dto.email, dto.password, dto.fullName));
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and obtain JWT' })
  @ApiBody({ schema: { example: { email: 'user@example.com', password: 'SecurePass123!' } } })
  @ApiEnvelopeOk('User and access token')
  @ApiEnvelopeErrors()
  async login(@Body() body: unknown) {
    const dto = loginSchema.parse(body);
    return ok(await this.auth.login(dto.email, dto.password));
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'), TokenVersionGuard)
  @ApiAuth()
  @ApiOperation({ summary: 'Logout (invalidate JWT via tokenVersion)' })
  @ApiEnvelopeOk()
  async logout(@Req() req: { user: JwtPayload }) {
    await this.auth.logout(req.user.sub);
    return ok({ loggedOut: true });
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'), TokenVersionGuard)
  @ApiAuth()
  @ApiOperation({ summary: 'Current authenticated user' })
  @ApiEnvelopeOk()
  async me(@Req() req: { user: JwtPayload }) {
    return ok(await this.auth.me(req.user.sub));
  }
}
