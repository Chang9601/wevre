import { Injectable } from '@nestjs/common';
import { Schema as MongooseSchema } from 'mongoose';

import { RoomsRepository } from './rooms.repository';
import { objectIdValidator } from '../../utils/objectid-validator';
import { ItemsRepository } from '../items/items.repository';
import { SendMessageDto } from '../../dtos/send-message.dto';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class RoomsService {
  constructor(
    private readonly roomsRepository: RoomsRepository,
    private readonly itemsRepository: ItemsRepository,
    private readonly usersRepository: UsersRepository,
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

  async addMessage(sendMessageDto: SendMessageDto) {
    const { content, userId, roomId } = sendMessageDto;

    const user = await this.usersRepository.findById(userId);
    const room = await this.findById(roomId);

    const messageId = await this.roomsRepository.addMessage(
      content,
      user,
      room,
    );

    return messageId;
  }
}
