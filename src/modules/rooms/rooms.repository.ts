import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InternalServerErrorException } from '@nestjs/common';
import { Room } from '../../entities/room.entity';
import { Item } from '../../entities/item.entity';

export class RoomsRepository {
  constructor(
    @InjectModel(Room.name) private readonly roomsModel: Model<Room>,
  ) {}

  async create(item: Item) {
    try {
      const { itemName, startDate, endDate } = item;

      let room = new this.roomsModel({
        name: `${itemName} 경매방`,
        description: `본 경매방은 ${startDate}일에 시작하여 ${endDate}일에 종료됩니다.`,
        startDate: startDate,
        endDate: endDate,
        item: item,
      });

      room = await room.save();
      return room._id;
    } catch (error) {
      throw new InternalServerErrorException('Error while saving room.');
    }
  }

  // async findOne(email: string): Promise<User> {
  //   try {
  //     return await this.usersModel.findOne({ email });
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       'Error while finding user by email.',
  //     );
  //   }
  // }
}
