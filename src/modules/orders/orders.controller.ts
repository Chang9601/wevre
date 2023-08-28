import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { OrderDto } from '../../dtos/order.dto';
// import { OrdersDto } from '../../dtos/orders.dto';
import { CreateOrderDto } from '../../dtos/create-order.dto';
import { OrdersDto } from '../../dtos/orders.dto';
import { PaginationDto } from '../../dtos/pagination.dto';
import { OrdersService } from './orders.service';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Serialize } from '../../interceptors/serialize.interceptor';

@ApiTags('orders')
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiUnauthorizedResponse({
    description: '인증되지 않아 API 사용 불가능.',
  })
  @ApiNotFoundResponse({
    description: '빈 입찰 목록.',
  })
  @ApiCreatedResponse({
    type: OrderDto,
    description: '주문 생성 성공.',
  })
  @ApiBody({
    type: CreateOrderDto,
  })
  @HttpCode(HttpStatus.CREATED)
  @Serialize(OrderDto)
  @Post('')
  async placeOrder(
    @Req() request: RequestWithUser,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const { user } = request;

    return await this.ordersService.create(createOrderDto, user);
  }

  @ApiUnauthorizedResponse({
    description: '인증되지 않아 API 사용 불가능.',
  })
  @ApiNotFoundResponse({
    description: '빈 주문 목록.',
  })
  @ApiOkResponse({
    type: OrdersDto,
    description: '주문 목록 검색 성공.',
  })
  @ApiQuery({
    type: PaginationDto,
  })
  @HttpCode(HttpStatus.OK)
  @Serialize(OrdersDto)
  @Get('')
  async getOrders(
    @Req() request: RequestWithUser,
    @Query()
    paginationDto: PaginationDto,
  ) {
    const { user } = request;

    return await this.ordersService.find(paginationDto, user);
  }
}
