import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema as MongooseSchema } from 'mongoose';

import { PaginationDto } from '../../dtos/pagination.dto';
import { MakeBidDto } from '../../dtos/make-bid.dto';
import { PageStateDto } from '../../dtos/page-state.dto';
import { PageDto } from '../../dtos/page.dto';
import { User } from '../../entities/user.entity';
import { Bid } from '../../entities/bid.entity';
import { Room } from '../../entities/room.entity';
import { UsersService } from '../users/users.service';
import { ItemsService } from '../items/items.service';
import { RoomsService } from '../rooms/rooms.service';
import { IBid } from '../../interfaces/types.interface';
import { QueryBuilder } from '../../common/factories/query-builder.factory';
import { buildFilter } from '../../common/factories/common.factory';

@Injectable()
export class BidsService {
  constructor(
    @InjectModel(Bid.name) private readonly bidsModel: Model<Bid>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => RoomsService))
    private readonly roomsService: RoomsService,
    private readonly itemsService: ItemsService,
  ) {}

  async create(makeBidDto: MakeBidDto): Promise<Bid> {
    const { price, userId, itemId, roomId } = makeBidDto;

    const userFilter = buildFilter('_id', userId);
    const itemFilter = buildFilter('_id', itemId);
    const roomFilter = buildFilter('_id', roomId);

    const user = await this.usersService.findOne(userFilter);
    const item = await this.itemsService.findOne(itemFilter);
    const room = await this.roomsService.findOne(roomFilter);

    const bid = await this.bidsModel.create({
      price,
      user,
      item,
      room,
    });

    return await bid.save();
  }

  async findHighestOne(_id: MongooseSchema.Types.ObjectId): Promise<IBid> {
    const itemFilter = buildFilter('item._id', _id);
    const room = await this.roomsService.findOne(itemFilter);

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
    const user = await this.usersService.findOne(userFilter);

    highestBid.id = bid._id;
    highestBid.price = bid.price;
    highestBid.name = user.name;
    highestBid.email = user.email;

    return highestBid as IBid;
  }

  async find(paginationDto: PaginationDto, user: User): Promise<PageDto<Bid>> {
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
  }

  async findAll(user: User): Promise<Bid[]> {
    return await this.bidsModel.find({ user }).populate('item').lean();
  }

  // 여러 경매가 종료된 작품 주문 시 해당하는 입찰을 모두 삭제한다.
  async deleteAll(_ids: MongooseSchema.Types.ObjectId[]) {
    return await this.bidsModel.deleteMany({ _id: { $in: _ids } });
  }

  // 경매방 삭제 시 가장 높은 입찰가를 제외한 나머지 입찰을 삭제한다.
  async deleteAllButHighest(room: Room, _id: MongooseSchema.Types.ObjectId) {
    return await this.bidsModel.deleteMany({
      room,
      _id: { $ne: _id },
    });
  }
}
