import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Schema as MongooseSchema } from 'mongoose';

import { RoomsRepository } from './rooms.repository';
import { objectIdValidator } from '../../utils/objectid-validator';
import { SendMessageDto } from '../../dtos/send-message.dto';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class RoomsService {
  constructor(
    private readonly roomsRepository: RoomsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'Asia/Seoul',
  })
  async create() {
    this.roomsRepository.create();
  }

  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
  //   timeZone: 'Asia/Seoul',
  // })
  // async delete() {
  //   this.roomsRepository.delete();
  // }

  async findById(id: MongooseSchema.Types.ObjectId) {
    objectIdValidator(id);

    return await this.roomsRepository.findById(id);
  }

  async findByItemId(id: MongooseSchema.Types.ObjectId) {
    objectIdValidator(id);

    return await this.roomsRepository.findByItemId(id);
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
