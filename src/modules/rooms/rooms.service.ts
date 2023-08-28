import { Injectable } from '@nestjs/common';
import { RoomsRepository } from './rooms.repository';
import { Schema as MongooseSchema } from 'mongoose';
import { ItemsRepository } from '../items/items.repository';

@Injectable()
export class RoomsService {
  constructor(
    private readonly roomsRepository: RoomsRepository,
    private readonly itemsRepository: ItemsRepository,
  ) {}

  async create(id: MongooseSchema.Types.ObjectId) {
    const item = await this.itemsRepository.findOne(id);

    return this.roomsRepository.create(item);
  }
}
