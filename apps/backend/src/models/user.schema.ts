import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { USER_ROLES, UserRole } from '@bloomstore/shared-types';

@Schema({ collection: 'users', timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true })
  fullName!: string;

  @Prop({ type: String, enum: USER_ROLES, default: 'customer' })
  role!: UserRole;

  @Prop({ default: 0 })
  tokenVersion!: number;

  @Prop({ default: 0 })
  failedLoginAttempts!: number;

  @Prop({ type: Date, default: null })
  lockUntil!: Date | null;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
