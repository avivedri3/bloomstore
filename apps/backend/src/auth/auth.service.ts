import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { ACCOUNT_LOCKED_CODE, AuthPayload, MAX_FAILED_LOGINS } from '@bloomstore/shared-types';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { AuditService } from '../audit/audit.service';
import { User } from '../models/user.schema';

const LOCK_MS = 15 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly users: Model<User>,
    private readonly jwt: JwtService,
    private readonly audit: AuditService,
  ) {}

  async register(email: string, password: string, fullName: string): Promise<AuthPayload> {
    const existing = await this.users.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new ConflictException({ code: 'EMAIL_TAKEN', message: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.users.create({
      email: email.toLowerCase(),
      passwordHash,
      fullName,
      role: 'customer',
      tokenVersion: 0,
    });
    await this.audit.record('user.register', 'users', user.id, user.id);
    return this.issue(user);
  }

  async login(email: string, password: string): Promise<AuthPayload> {
    const user = await this.users.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
    }
    if (user.lockUntil && user.lockUntil.getTime() > Date.now()) {
      throw new HttpException(
        { code: ACCOUNT_LOCKED_CODE, message: 'Account locked after too many failed attempts' },
        HttpStatus.LOCKED,
      );
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= MAX_FAILED_LOGINS) {
        user.lockUntil = new Date(Date.now() + LOCK_MS);
        await user.save();
        await this.audit.record('user.lockout', 'users', user.id, user.id);
        throw new HttpException(
          { code: ACCOUNT_LOCKED_CODE, message: 'Account locked after too many failed attempts' },
          HttpStatus.LOCKED,
        );
      }
      await user.save();
      throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
    }
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();
    await this.audit.record('user.login', 'users', user.id, user.id);
    return this.issue(user);
  }

  async logout(userId: string): Promise<void> {
    await this.users.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
    await this.audit.record('user.logout', 'users', userId, userId);
  }

  async me(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'User not found' });
    }
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
  }

  private issue(user: User & { id: string }): AuthPayload {
    const publicUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
    const accessToken = this.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });
    return { user: publicUser, accessToken };
  }
}
