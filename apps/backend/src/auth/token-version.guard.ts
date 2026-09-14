import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../models/user.schema';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class TokenVersionGuard implements CanActivate {
  constructor(@InjectModel(User.name) private readonly users: Model<User>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const payload = req.user;
    if (!payload) {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Missing token' });
    }
    const user = await this.users.findById(payload.sub);
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException({
        code: 'TOKEN_REVOKED',
        message: 'Session is no longer valid',
      });
    }
    return true;
  }
}
