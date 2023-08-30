import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Room } from '../../entities/room.entity';
import { Item } from '../../entities/item.entity';

export class RoomsRepository {
  constructor(
    @InjectModel(Room.name) private readonly roomsModel: Model<Room>,
  ) {}

  async create(item: Item) {
    try {
      const { itemName, startDate, endDate, adminNumber } = item;

      const duplicateItem = await this.findOne(adminNumber);

      if (duplicateItem) {
        throw new ConflictException('Room with this item already exists.');
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      const startYear = start.getFullYear();
      const startMonth = start.getMonth() + 1; // 월은 0부터 시작
      const startDay = start.getDate();

      const endYear = end.getFullYear();
      const endMonth = end.getMonth() + 1;
      const endDay = end.getDate();

      let room = new this.roomsModel({
        name: `${itemName} 경매방`,
        description: `본 경매방은 ${startYear}년 ${startMonth}월 ${startDay}일에 시작하여 ${endYear}년 ${endMonth}월 ${endDay}일에 종료됩니다.`,
        startDate: startDate,
        endDate: endDate,
        item: item,
      });

      room = await room.save();
      return room._id;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Error while saving room.');
      }
    }
  }

  async findOne(adminNumber: string) {
    try {
      return this.roomsModel.findOne({ 'item.adminNumber': adminNumber });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while finding room by administration number.',
      );
    }
  }
}
