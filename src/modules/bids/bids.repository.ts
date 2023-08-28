import { InjectModel } from '@nestjs/mongoose';
import {
  Inject,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { Model, Schema as MongooseSchema } from 'mongoose';

import { PageStateDto } from '../../dtos/page-state.dto';
import { PageDto } from '../../dtos/page.dto';
import { PaginationDto } from '../../dtos/pagination.dto';
import { Bid } from '../../entities/bid.entity';
import { Room } from '../../entities/room.entity';
import { Item } from '../../entities/item.entity';
import { User } from '../../entities/user.entity';
import { RoomsRepository } from '../rooms/rooms.repository';
import { UsersRepository } from '../users/users.repository';
import { IBid, IBids } from '../../interfaces/types.interface';
import { QueryBuilder } from '../../common/factories/query-builder.factory';
import { buildFilter } from '../../common/factories/common.factory';

export class BidsRepository {
  constructor(
    @InjectModel(Bid.name) private readonly bidsModel: Model<Bid>,
    private readonly usersResitory: UsersRepository,
    @Inject(forwardRef(() => RoomsRepository))
    private readonly roomsRepository: RoomsRepository,
  ) {}

  async create(
    price: number,
    user: User,
    item: Item,
    room: Room,
  ): Promise<Bid> {
    try {
      const bid = new this.bidsModel({
        price,
        user,
        item,
        room,
      });

      return await bid.save();
    } catch (error) {
      throw new InternalServerErrorException('입찰 중 오류 발생.');
    }
  }

  async findOne(id: MongooseSchema.Types.ObjectId) {
    try {
      const itemFilter = buildFilter('item._id', id);
      const room = await this.roomsRepository.findOne(itemFilter);

      if (!room) {
        throw new NotFoundException('아이디에 해당하는 경매방 없음.');
      }

      // 콜레이션(collation)으로 문자열을 정수로 파싱한다.
      const bid = await this.bidsModel
        .findOne({ room })
        .sort({ price: -1 })
        .collation({ locale: 'en_US', numericOrdering: true })
        .lean();

      // DTO 변환 필요(null, undefined 처리.).
      const highestBid: Partial<IBid> = {
        price: 0,
      };

      if (!bid) {
        return highestBid as IBid;
      }

      const userFilter = buildFilter('_id', bid.user._id);
      const user = await this.usersResitory.findOne(userFilter);

      highestBid.id = bid._id;
      highestBid.price = bid.price;
      highestBid.name = user.name;
      highestBid.email = user.email;

      return highestBid as IBid;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('최고 입찰가 검색 중 오류 발생.');
    }
  }

  async find(paginationDto: PaginationDto, user: User): Promise<PageDto<Bid>> {
    try {
      const { limit, sort, skip, search } = paginationDto;

      const EXCLUDED_FIELDS = '-createdAt -updatedAt';

      const queryBuilder = new QueryBuilder(search, sort);
      const sortQuery = queryBuilder.buildSortQuery();

      const bids = await this.bidsModel
        .find({ user })
        .select(EXCLUDED_FIELDS)
        .populate('item')
        .skip(skip)
        .limit(limit)
        .sort(sortQuery)
        .lean();

      const total = await this.bidsModel.countDocuments({ user });

      const pageStateDto = new PageStateDto(total, paginationDto);

      if (pageStateDto.lastPage < pageStateDto.currentPage) {
        throw new NotFoundException('존재하지 않는 페이지.');
      }

      return new PageDto(pageStateDto, bids);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('입찰 목록 검색 중 오류 발생.');
    }
  }

  async findAll(user: User): Promise<IBids> {
    try {
      const bids = await this.bidsModel.find({ user }).lean();
      const total = bids.length;

      return { bids, total };
    } catch (error) {
      throw new InternalServerErrorException(
        '입찰 목록 전체 검색 중 오류 발생.',
      );
    }
  }

  async deleteAll(ids: MongooseSchema.Types.ObjectId[]) {
    try {
      // 여러 작품 주문 시 해당하는 입찰을 모두 삭제한다.
      await this.bidsModel.deleteMany({ _id: { $in: ids } });
    } catch (error) {
      throw new InternalServerErrorException('입찰 목록 삭제 중 오류 발생.');
    }
  }
}
