import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Schema as MongooseSchema } from 'mongoose';

import { Room } from '../../entities/room.entity';
import { Item } from '../../entities/item.entity';
import { Message } from '../../entities/message.entity';
import { User } from '../../entities/user.entity';

export class RoomsRepository {
  constructor(
    @InjectModel(Room.name) private readonly roomsModel: Model<Room>,
    @InjectModel(Message.name) private readonly messagesModel: Model<Message>,
  ) {}

  async create(item: Item, _id: MongooseSchema.Types.ObjectId) {
    try {
      const { itemName, startDate, endDate } = item;

      const duplicateItem = await this.findByItemId(_id);

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

  async findById(_id: MongooseSchema.Types.ObjectId): Promise<Room> {
    try {
      return this.roomsModel.findOne({ _id });
    } catch (error) {
      throw new InternalServerErrorException('Error while finding room by id.');
    }
  }

  async findByItemId(_id: MongooseSchema.Types.ObjectId): Promise<Room> {
    try {
      return this.roomsModel.findOne({ 'item._id': _id });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while finding room by item id.',
      );
    }
  }

  async addMessage(content: string, user: User, room: Room) {
    try {
      let message = new this.messagesModel({
        content,
        user,
        room,
      });

      message = await message.save();
      return message._id;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while adding message to room.',
      );
    }
  }
}
