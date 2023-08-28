import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, FilterQuery, Model } from 'mongoose';
import {
  Inject,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';

import { Room } from '../../entities/room.entity';
import { Bid } from '../../entities/bid.entity';
import { BidsRepository } from '../bids/bids.repository';
import { ItemsRepository } from '../items/items.repository';
import { buildFilter, formatDate } from '../../common/factories/common.factory';

export class RoomsRepository {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Room.name) private readonly roomsModel: Model<Room>,
    @InjectModel(Bid.name) private readonly bidsModel: Model<Bid>,
    private readonly itemsRepository: ItemsRepository,
    @Inject(forwardRef(() => BidsRepository))
    private readonly bidsRepository: BidsRepository,
  ) {}

  async create() {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const { items } = await this.itemsRepository.findAll();

      for (const item of items) {
        const startDate = item.startDate;
        const endDate = item.endDate;

        const {
          year: startYear,
          month: startMonth,
          day: startDay,
        } = formatDate(startDate);

        const {
          year: endYear,
          month: endMonth,
          day: endDay,
        } = formatDate(endDate);

        const todayMs = Date.now();
        const startDateMs = startDate.getTime();
        const endDateMs = endDate.getTime();

        if (startDateMs <= todayMs && todayMs <= endDateMs) {
          const filter = buildFilter('item._id', item._id);
          let room = await this.findOne(filter);

          if (!room) {
            item.auctionStatus = true;

            const name = `${item.itemName} 경매방`;
            const description = `${startYear}년 ${startMonth}월 ${startDay}일 시작, ${endYear}년 ${endMonth}월 ${endDay}일 종료`;

            room = new this.roomsModel({
              name,
              description,
              startDate,
              endDate,
              item,
            });

            await item.save();
            await room.save();
          }
        }
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();

      throw new InternalServerErrorException('경매방 생성 중 오류 발생.');
    } finally {
      await session.endSession();
    }
  }

  async delete() {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const { items } = await this.itemsRepository.findAll();

      for (const item of items) {
        const startDate = item.startDate.getTime();
        const endDate = item.endDate.getTime();
        const today = Date.now();

        if (startDate > today || today > endDate) {
          const filter = buildFilter('item._id', item._id);
          const room = await this.findOne(filter);

          if (room) {
            item.auctionStatus = false;
            // 아무도 입찰하지 않은 경우(즉, 0원) 예외 처리가 필요하다.
            const highestBid = await this.bidsRepository.findOne(item._id);

            await item.save();

            if (highestBid) {
              await this.bidsModel.deleteMany({
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
      await session.abortTransaction();

      throw new InternalServerErrorException('경매방 삭제 중 오류 발생.');
    } finally {
      await session.endSession();
    }
  }

  async findOne(filter: FilterQuery<Room>): Promise<Room> {
    try {
      const room = await this.roomsModel.findOne(filter).lean();

      if (!room) {
        throw new InternalServerErrorException('경매방 없음.');
      }

      return room;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('경매방 검색 중 오류 발생');
    }
  }
}
