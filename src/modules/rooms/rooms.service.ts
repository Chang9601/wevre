import { Injectable } from '@nestjs/common';
import { RoomsRepository } from './rooms.repository';
import { objectIdValidator } from '../../utils/objectid-validator';
import { Schema as MongooseSchema } from 'mongoose';
import { ItemsRepository } from '../items/items.repository';

@Injectable()
export class RoomsService {
  constructor(
    private readonly roomsRepository: RoomsRepository,
    private readonly itemsRepository: ItemsRepository,
  ) {}

  async create(id: MongooseSchema.Types.ObjectId) {
    objectIdValidator(id);

    const item = await this.itemsRepository.findOne(id, true);
    return this.roomsRepository.create(item);
  }
}
