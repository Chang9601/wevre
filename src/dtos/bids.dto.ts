import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import * as moment from 'moment';

import { PageStateDto } from './page-state.dto';
import { Bid } from '../entities/bid.entity';

export class BidsDto {
  @ApiProperty({
    example: {
      total: 8,
      limit: 10,
      offset: 1,
      currentPage: 1,
      lastPage: 1,
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
        bidId: '65ab5c3db2f6afc6f45c89ed',
        price: 5062300,
        initialBid: 5070000,
        auctionStatus: true,
        itemId: '64e8931bb743b0ae0d83c93c',
        itemName: '제발',
        startDate: '2023-12-15',
        endDate: '2023-01-31',
      },
      {
        bidId: '65ab5db066acb5ae288f20c1',
        price: 5300000,
        initialBid: 5200000,
        auctionStatus: true,
        itemId: '64e8931bb743b0ae0d83c923',
        itemName: '별들이',
        startDate: '2023-11-15',
        endDate: '2023-12-31',
      },
    ],
  })
  @Transform(({ obj }) =>
    obj.data.map((bid: Bid) => ({
      bidId: bid._id,
      price: bid.price,
      initialBid: bid.item.initialBid,
      auctionStatus: bid.item.auctionStatus,
      itemId: bid.item._id,
      itemName: bid.item.itemName,
      startDate: moment(bid.item.startDate).format('YYYY-MM-DD'),
      endDate: moment(bid.item.endDate).format('YYYY-MM-DD'),
    })),
  )
  @Type(() => Bid)
  @Expose()
  bids: Bid[];
}
