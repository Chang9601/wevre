import { Expose, Transform, Type } from 'class-transformer';
import * as moment from 'moment';

import { PageStateDto } from './page-state.dto';
import { Item } from '../entities/item.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ItemsDto {
  @ApiProperty({
    example: {
      total: 6,
      limit: 2,
      offset: 1,
      currentPage: 2,
      lastPage: 3,
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
        itemId: '64e8931bb743b0ae0d83c920',
        itemName: '경청',
        auctionStatus: true,
        initialBid: 1952000,
        startDate: '2024-01-10',
        endDate: '2024-02-01',
      },
      {
        itemId: '64e8931bb743b0ae0d83c934',
        itemName: '숲',
        auctionStatus: true,
        initialBid: 1352000,
        startDate: '2024-02-05',
        endDate: '2024-03-15',
      },
    ],
  })
  @Transform(({ obj }) =>
    obj.data.map((item: Item) => ({
      // ...item을 사용하면 필드가 _doc 속성에 포함되어 있어서 따로 필드를 지정한다.
      // ...item
      itemId: item._id,
      itemName: item.itemName,
      auctionStatus: item.auctionStatus,
      initialBid: item.initialBid,
      startDate: moment(item.startDate).format('YYYY-MM-DD'),
      endDate: moment(item.endDate).format('YYYY-MM-DD'),
    })),
  )
  @Type(() => Item)
  @Expose()
  items: Item[];
}
