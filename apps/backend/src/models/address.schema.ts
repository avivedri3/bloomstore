import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ collection: 'addresses', timestamps: true })
export class Address {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  fullName!: string;

  @Prop({ required: true })
  phone!: string;

  @Prop({ required: true })
  city!: string;

  @Prop({ required: true })
  street!: string;

  @Prop({ required: true })
  houseNumber!: string;

  @Prop()
  apartment?: string;

  @Prop()
  notes?: string;

  @Prop({ default: false })
  isDefault!: boolean;
}

export type AddressDocument = HydratedDocument<Address>;
export const AddressSchema = SchemaFactory.createForClass(Address);
