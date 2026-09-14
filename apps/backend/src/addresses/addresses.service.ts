import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { addressInputSchema } from '@bloomstore/shared-types';
import { Model, Types } from 'mongoose';
import { Address } from '../models/address.schema';

@Injectable()
export class AddressesService {
  constructor(@InjectModel(Address.name) private readonly addresses: Model<Address>) {}

  async list(userId: string) {
    return this.addresses.find({ userId: new Types.ObjectId(userId) }).sort({ isDefault: -1 });
  }

  async create(userId: string, input: unknown) {
    const dto = addressInputSchema.parse(input);
    if (dto.isDefault) {
      await this.addresses.updateMany({ userId: new Types.ObjectId(userId) }, { isDefault: false });
    }
    return this.addresses.create({ ...dto, userId: new Types.ObjectId(userId) });
  }

  async ensureOwned(userId: string, addressId: string) {
    const address = await this.addresses.findOne({
      _id: addressId,
      userId: new Types.ObjectId(userId),
    });
    if (!address) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Address not found' });
    }
    return address;
  }
}
