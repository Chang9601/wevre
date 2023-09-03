import { Injectable } from '@nestjs/common';
import { Schema as MongooseSchema } from 'mongoose';

import { ItemsRepository } from './items.repository';
import { objectIdValidator } from '../../utils/objectid-validator';

@Injectable()
export class ItemsService {
  constructor(private readonly itemsRepository: ItemsRepository) {}

  async findOne(id: MongooseSchema.Types.ObjectId) {
    objectIdValidator(id);

    return await this.itemsRepository.findOne(id);
  }

  async find(limit: number, skip: number, search: string, sort: string) {
    return await this.itemsRepository.find(limit, skip, search, sort);
  }
}
