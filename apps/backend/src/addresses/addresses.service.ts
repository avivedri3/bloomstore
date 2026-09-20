import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AddressDto, addressInputSchema } from '@bloomstore/shared-types';
import { Model, Types } from 'mongoose';
import { Address, AddressDocument } from '../models/address.schema';

@Injectable()
export class AddressesService {
  constructor(@InjectModel(Address.name) private readonly addresses: Model<Address>) {}

  async list(userId: string): Promise<AddressDto[]> {
    const rows = await this.addresses.find({ userId: new Types.ObjectId(userId) }).sort({ isDefault: -1 });
    return rows.map((row) => this.toDto(row));
  }

  async create(userId: string, input: unknown): Promise<AddressDto> {
    const dto = addressInputSchema.parse(input);
    if (dto.isDefault) {
      await this.addresses.updateMany({ userId: new Types.ObjectId(userId) }, { isDefault: false });
    }
    const created = await this.addresses.create({ ...dto, userId: new Types.ObjectId(userId) });
    return this.toDto(created);
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

  private toDto(address: AddressDocument): AddressDto {
    return {
      id: String(address._id),
      fullName: address.fullName,
      phone: address.phone,
      city: address.city,
      street: address.street,
      houseNumber: address.houseNumber,
      apartment: address.apartment,
      notes: address.notes,
      isDefault: address.isDefault,
    };
  }
}
