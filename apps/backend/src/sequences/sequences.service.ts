import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sequence } from '../models/sequence.schema';

@Injectable()
export class SequencesService {
  constructor(@InjectModel(Sequence.name) private readonly sequences: Model<Sequence>) {}

  async next(name: string): Promise<number> {
    const doc = await this.sequences.findOneAndUpdate(
      { name },
      { $inc: { value: 1 } },
      { upsert: true, new: true },
    );
    return doc.value;
  }
}
