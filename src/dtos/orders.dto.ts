import { Expose, Transform, Type } from 'class-transformer';
import * as moment from 'moment';
import { ApiProperty } from '@nestjs/swagger';

import { PageStateDto } from './page-state.dto';
import { Order } from '../entities/order.entity';

export class OrdersDto {
  @ApiProperty({
    example: {
      total: 3,
      limit: 2,
      offset: 1,
      currentPage: 1,
      lastPage: 2,
      isPreviousPageValid: false,
      isNextPageValid: true,
    },
  })
  @Transform(({ obj }) => obj.state)
  @Type(() => PageStateDto)
  @Expose()
  pageState: PageStateDto;

  @ApiProperty({
    example: [
      {
        id: '65a7caf10f07b24e435b49db',
        totalPrice: 3304000,
        totalQuantity: 2,
        streetAddress: '부산광역시 기장군 일광읍 기장대로 692',
        address: '4층 정장계',
        zipcode: '46044',
        orderNumber: '30f37f05-474e-4317-b194-2201caeaa837',
        orderDate: '2024-01-17',
      },
    ],
  })
  @Transform(({ obj }) =>
    obj.data.map((order: Order) => ({
      id: order._id,
      totalPrice: order.totalPrice,
      totalQuantity: order.totalQuantity,
      streetAddress: order.streetAddress,
      address: order.address,
      zipcode: order.zipcode,
      orderNumber: order.orderNumber,
      orderDate: moment(order.orderDate).format('YYYY-MM-DD'),
    })),
  )
  @Type(() => Order)
  @Expose()
  orders: Order[];
}
