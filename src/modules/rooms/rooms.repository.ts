import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import {
  Inject,
  InternalServerErrorException,
  forwardRef,
} from '@nestjs/common';
import { Schema as MongooseSchema } from 'mongoose';
import * as moment from 'moment';

import { Room } from '../../entities/room.entity';
import { Item } from '../../entities/item.entity';
import { Message } from '../../entities/message.entity';
import { User } from '../../entities/user.entity';
import { BidsRepository } from '../bids/bids.repository';

export class RoomsRepository {
  constructor(
    @InjectModel(Room.name) private readonly roomsModel: Model<Room>,
    @InjectModel(Message.name) private readonly messagesModel: Model<Message>,
    @InjectModel(Item.name) private readonly itemsModel: Model<Item>,
    @InjectConnection() private readonly connection: Connection,
    @Inject(forwardRef(() => BidsRepository))
    private readonly bidsRepository: BidsRepository,
  ) {}

  async create() {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const items = await this.itemsModel.find();

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        const startDate = item.startDate;
        const endDate = item.endDate;

        const {
          year: startYear,
          month: startMonth,
          day: startDay,
        } = this.formatDateToForm(startDate);

        const {
          year: endYear,
          month: endMonth,
          day: endDay,
        } = this.formatDateToForm(endDate);

        const today = moment(new Date());

        if (today.isBetween(startDate, endDate)) {
          let room = await this.findByItemId(item._id);

          if (!room) {
            item.auctionStatus = true;

            room = new this.roomsModel({
              name: `${item.itemName} 경매방`,
              description: `본 경매방은 ${startYear}년 ${startMonth}월 ${startDay}일에 시작하여 ${endYear}년 ${endMonth}월 ${endDay}일에 종료됩니다.`,
              startDate: startDate,
              endDate: endDate,
              item: item,
            });

            await item.save();
            await room.save();
          }
        }
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();

      throw new InternalServerErrorException('Error creating a room.');
    } finally {
      session.endSession();
    }
  }

  async delete() {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const items = await this.itemsModel.find();

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        const startDate = item.startDate;
        const endDate = item.endDate;

        const today = moment(new Date());

        if (!today.isBetween(startDate, endDate)) {
          const room = await this.findByItemId(item._id);

          if (room) {
            item.auctionStatus = false;

            // const highestBid = await this.messagesModel
            //   .findOne({ room: room })
            //   .sort({ content: -1 })
            //   .collation({ locale: 'en_US', numericOrdering: true });

            const highestBid = await this.bidsRepository.findOne(item._id);

            await item.save();
            if (highestBid) {
              await this.messagesModel.deleteMany({
                room: room,
                _id: { $ne: highestBid.id },
              });
            }
            await room.deleteOne();
          }
        }
      }

      await session.commitTransaction();
    } catch (error) {
      console.log(error);

      await session.abortTransaction();

      throw new InternalServerErrorException('Error deleting a room.');
    } finally {
      session.endSession();
    }
  }

  async findById(_id: MongooseSchema.Types.ObjectId): Promise<Room> {
    try {
      return this.roomsModel.findOne({ _id });
    } catch (error) {
      throw new InternalServerErrorException('Error finding a room by id.');
    }
  }

  async findByItemId(_id: MongooseSchema.Types.ObjectId): Promise<Room> {
    try {
      return this.roomsModel.findOne({ 'item._id': _id }).select('_id');
    } catch (error) {
      throw new InternalServerErrorException(
        'Error finding a room by item id.',
      );
    }
  }

  async addMessage(content: string, user: User, item: Item, room: Room) {
    try {
      let message = new this.messagesModel({
        content,
        user,
        item,
        room,
      });

      message = await message.save();
      return message._id;
    } catch (error) {
      throw new InternalServerErrorException('Error adding a message to room.');
    }
  }

  private formatDateToForm(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return { year, month, day };
  }
}
