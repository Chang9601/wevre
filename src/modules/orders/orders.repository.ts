import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import {
  Inject,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { randomUUID } from 'crypto';

import { BidsRepository } from '../bids/bids.repository';
import { CreateOrderDto } from '../../dtos/create-order.dto';
import { PageStateDto } from '../../dtos/page-state.dto';
import { PageDto } from '../../dtos/page.dto';
import { PaginationDto } from '../../dtos/pagination.dto';
import { User } from '../../entities/user.entity';
import { Order } from '../../entities/order.entity';
import { QueryBuilder } from '../../common/factories/query-builder.factory';

export class OrdersRepository {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Order.name) private readonly ordersModel: Model<Order>,
    @Inject(forwardRef(() => BidsRepository))
    private readonly bidsRepository: BidsRepository,
  ) {}

  // 주문 시 상품을 삭제해야 하는데 일단 보류한다.
  async create(createOrderDto: CreateOrderDto, user: User): Promise<Order> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const { bids, total: totalQuantity } = await this.bidsRepository.findAll(
        user,
      );

      if (!bids) {
        throw new NotFoundException('빈 입찰.');
      }

      const items = bids.map((bid) => {
        return bid.item;
      });
      const totalPrice = bids.reduce((total, bid) => {
        return total + bid.price;
      }, 0);

      const orderDate = Date.now();
      const orderNumber = randomUUID();

      const order = new this.ordersModel({
        ...createOrderDto,
        totalPrice,
        totalQuantity,
        orderNumber,
        orderDate,
        user,
        items,
      });

      await this.bidsRepository.deleteAll(
        bids.map((bid) => {
          return bid._id;
        }),
      );

      await order.save();

      await session.commitTransaction();

      return order;
    } catch (error) {
      await session.abortTransaction();

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('주문 생성 중 오류 발생.');
    } finally {
      await session.endSession();
    }
  }

  async find(
    paginationDto: PaginationDto,
    user: User,
  ): Promise<PageDto<Order>> {
    try {
      const { limit, sort, skip, search } = paginationDto;

      const EXCLUDED_FIELDS = '-createdAt -updatedAt';

      const queryBuilder = new QueryBuilder(search, sort);
      const sortQuery = queryBuilder.buildSortQuery();

      const bids = await this.ordersModel
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

      return new PageDto(pageStateDto, bids);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('주문 목록 검색 중 오류 발생.');
    }
  }
}
