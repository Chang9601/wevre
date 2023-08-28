import { Injectable } from '@nestjs/common';

import { PaginationDto } from '../../dtos/pagination.dto';
import { CreateOrderDto } from '../../dtos/create-order.dto';
import { User } from '../../entities/user.entity';
import { OrdersRepository } from './orders.repository';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async create(createOrderDto: CreateOrderDto, user: User) {
    return await this.ordersRepository.create(createOrderDto, user);
  }

  async find(paginationDto: PaginationDto, user: User) {
    return await this.ordersRepository.find(paginationDto, user);
  }
}
