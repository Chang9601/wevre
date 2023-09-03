import { Injectable } from '@nestjs/common';
import { Schema as MongooseSchema } from 'mongoose';

import { RoomsRepository } from './rooms.repository';
import { objectIdValidator } from '../../utils/objectid-validator';
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
    return this.roomsRepository.create(item, id);
  }

  async findById(id: MongooseSchema.Types.ObjectId) {
    objectIdValidator(id);

    const room = await this.roomsRepository.findById(id);
    return room;
  }

  async findByItemId(id: MongooseSchema.Types.ObjectId) {
    objectIdValidator(id);

    const room = await this.roomsRepository.findByItemId(id);
    return room;
  }
}
