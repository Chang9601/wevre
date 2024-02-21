import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { Schema as MongooseSchema } from 'mongoose';
import * as moment from 'moment';
import { Moment } from 'moment';

export class OrderDto {
  @ApiProperty({
    example: '65a7caf10f07b24e435b49db',
  })
  @Expose()
  id: MongooseSchema.Types.ObjectId;

  @ApiProperty({
    example: 1,
  })
  @Expose()
  totalPrice: number;

  @ApiProperty({
    example: 3,
  })
  @Expose()
  totalQuantity: number;

  @ApiProperty({
    example: 'b7dddbc1-67de-41d4-9afb-306488fa937a',
  })
  @Expose()
  orderNumber: string;

  @ApiProperty({
    example: '2023-01-20',
  })
  @Transform(({ value }) => moment(value).format('YYYY-MM-DD'))
  @Type(() => Date)
  @Expose()
  orderDate: Moment;

  @ApiProperty({
    minLength: 3,
    description: '도로명 주소.',
    example: '부산광역시 기장군 일광읍 기장대로 692',
  })
  @Expose()
  streetAddress: string;

  @ApiProperty({
    description: '상세 주소.',
    example: '4층 정장계',
  })
  @Expose()
  address: string;

  @ApiProperty({
    description: '우편번호는 정확히 다섯 자리의 숫를 반드시 포함.',
    example: '46044',
  })
  @Expose()
  zipcode: string;
}
