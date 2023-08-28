import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FilterQuery } from 'mongoose';

import { RoomsRepository } from './rooms.repository';
import { Room } from '../../entities/room.entity';

@Injectable()
export class RoomsService {
  constructor(private readonly roomsRepository: RoomsRepository) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'Asia/Seoul',
  })
  async create() {
    this.roomsRepository.create();
  }

  async findOne(filter: FilterQuery<Room>) {
    return await this.roomsRepository.findOne(filter);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'Asia/Seoul',
  })
  async delete() {
    this.roomsRepository.delete();
  }
}
