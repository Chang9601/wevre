import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ClientSession, startSession } from 'mongoose';

import { Room } from '../../entities/room.entity';
import { ItemsService } from '../items/items.service';
import { BidsService } from '../bids/bids.service';
import { IMessage } from '../../interfaces/types.interface';
import { buildFilter, formatDate } from '../../common/factories/common.factory';

@Injectable()
export class RoomsService {
  private session: ClientSession;

  constructor(
    @InjectModel(Room.name) private readonly roomsModel: Model<Room>,
    private readonly itemsService: ItemsService,
    @Inject(forwardRef(() => BidsService))
    private readonly bidsService: BidsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'Asia/Seoul',
  })
  async create(): Promise<IMessage> {
    this.session = await startSession();

    // 트랜잭션을 수동으로 통제하는 대신 withTransaction() 메서드를 사용한다.
    // startTransaction() 메서드, commitTransaction() 메서드와 abortTransaction() 메서드를 생략할 수 있다.
    await this.session.withTransaction(async () => {
      const items = await this.itemsService.findAll();

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

            room = await this.roomsModel.create({
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
    });

    await this.session.endSession();

    return { message: '경매방 생성 완료.' };
  }

  async findOne(filter: FilterQuery<Room>): Promise<Room> {
    // deleteOne() 메서드를 사용해야 하기 때문에 lean() 메서드를 생략한다.
    const room = await this.roomsModel.findOne(filter);

    if (!room) {
      throw new NotFoundException('경매방 없음.');
    }

    return room;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'Asia/Seoul',
  })
  async delete(): Promise<IMessage> {
    this.session = await startSession();

    await this.session.withTransaction(async () => {
      const items = await this.itemsService.findAll();

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
            const highestBid = await this.bidsService.findHighestOne(item._id);

            await item.save();

            if (highestBid) {
              await this.bidsService.deleteAllButHighest(room, highestBid.id);
            }

            await room.deleteOne();
          }
        }
      }
    });

    await this.session.endSession();

    return { message: '경매방 삭제 완료.' };
  }
}
