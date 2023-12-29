import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Schema as MongooseSchema } from 'mongoose';

import { RoomsRepository } from './rooms.repository';
import { objectIdValidator } from '../../utils/objectid-validator';
import { SendMessageDto } from '../../dtos/send-message.dto';
import { UsersRepository } from '../users/users.repository';
import { ItemsRepository } from '../items/items.repository';

@Injectable()
export class RoomsService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly itemsRepository: ItemsRepository,
    private readonly roomsRepository: RoomsRepository,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE, {
    timeZone: 'Asia/Seoul',
  })
  async create() {
    this.roomsRepository.create();
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    timeZone: 'Asia/Seoul',
  })
  async delete() {
    this.roomsRepository.delete();
  }

  async findById(id: MongooseSchema.Types.ObjectId) {
    objectIdValidator(id);

    return await this.roomsRepository.findById(id);
  }

  async findByItemId(id: MongooseSchema.Types.ObjectId) {
    objectIdValidator(id);

    return await this.roomsRepository.findByItemId(id);
  }

  async sendMessage(sendMessageDto: SendMessageDto) {
    const { content, userId, itemId, roomId } = sendMessageDto;

    const user = await this.usersRepository.findById(userId);
    const item = await this.itemsRepository.findOne(itemId);
    const room = await this.findById(roomId);

    const messageId = await this.roomsRepository.sendMessage(
      content,
      user,
      item,
      room,
    );

    return messageId;
  }
}
