import { Injectable } from '@nestjs/common';
import { Schema as MongooseSchema } from 'mongoose';

import { objectIdValidator } from '../../utils/objectid-validator';
import { BidsRepository } from './bids.repository';

@Injectable()
export class BidsService {
  constructor(private readonly bidsRepository: BidsRepository) {}

  async findOne(id: MongooseSchema.Types.ObjectId) {
    objectIdValidator(id);

    return await this.bidsRepository.findOne(id);
  }
}
