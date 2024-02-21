import { randomUUID } from 'crypto';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, startSession, Model } from 'mongoose';

import { PaginationDto } from '../../dtos/pagination.dto';
import { CreateOrderDto } from '../../dtos/create-order.dto';
import { PageStateDto } from '../../dtos/page-state.dto';
import { PageDto } from '../../dtos/page.dto';
import { User } from '../../entities/user.entity';
import { Order } from '../../entities/order.entity';
import { BidsService } from '../bids/bids.service';
import { QueryBuilder } from '../../common/factories/query-builder.factory';

@Injectable()
export class OrdersService {
  private session: ClientSession;

  constructor(
    @InjectModel(Order.name) private readonly ordersModel: Model<Order>,
    private readonly bidsService: BidsService,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: User): Promise<Order> {
    let order: Order;

    this.session = await startSession();

    await this.session.withTransaction(async () => {
      const bids = await this.bidsService.findAll(user);

      if (!bids.length) {
        throw new NotFoundException('입찰 내역 없음.');
      }

      // 경매가 종료된 작품만 주문한다.
      const items = bids
        .map((bid) => bid.item)
        .filter((item) => item.auctionStatus === false);

      const totalPrice = bids
        .filter((bid) => bid.item.auctionStatus === false)
        .reduce((total, bid) => total + bid.price, 0);

      const totalQuantity = items.length;
      const orderDate = Date.now();
      const orderNumber = randomUUID();

      const newOrder = await this.ordersModel.create({
        ...createOrderDto,
        totalPrice,
        totalQuantity,
        orderNumber,
        orderDate,
        user,
        items,
      });

      await this.bidsService.deleteAll(
        bids
          .filter((bid) => bid.item.auctionStatus === false)
          .map((bid) => bid._id),
      );

      order = await newOrder.save();
    });

    await this.session.endSession();

    return order;
  }

  async find(
    paginationDto: PaginationDto,
    user: User,
  ): Promise<PageDto<Order>> {
    const { limit, sort, skip, search } = paginationDto;

    const EXCLUDED_FIELDS = '-createdAt -updatedAt';

    const queryBuilder = new QueryBuilder(search, sort);
    const sortQuery = queryBuilder.buildSortQuery();

    const orders = await this.ordersModel
      .find({ user })
      .select(EXCLUDED_FIELDS)
      .skip(skip)
      .limit(limit)
      .sort(sortQuery)
      .lean();

    const total = await this.ordersModel.countDocuments({ user });

    const pageStateDto = new PageStateDto(total, paginationDto);

    if (pageStateDto.lastPage < pageStateDto.currentPage) {
      throw new NotFoundException('존재하지 않는 페이지.');
    }

    return new PageDto(pageStateDto, orders);
  }
}
