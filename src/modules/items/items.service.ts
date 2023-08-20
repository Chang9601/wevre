import { BadRequestException, Injectable } from '@nestjs/common';
import { Schema as MongooseSchema, Types } from 'mongoose';
import { ItemsRepository } from './items.repository';

@Injectable()
export class ItemsService {
  constructor(private readonly itemsRepository: ItemsRepository) {}

  async findOne(id: MongooseSchema.Types.ObjectId) {
    if (!Types.ObjectId.isValid(id.toString())) {
      throw new BadRequestException('Invalid ObjectId.');
    }

    return await this.itemsRepository.findOne(id);
  }

  async find(limit: number, skip: number, search: string, sort: string) {
    return await this.itemsRepository.find(limit, skip, search, sort);
  }
}
