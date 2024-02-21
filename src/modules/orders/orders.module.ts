import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Order, OrderSchema } from '../../entities/order.entity';
import { Bid, BidSchema } from '../../entities/bid.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { BidsModule } from '../bids/bids.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      {
        name: Bid.name,
        schema: BidSchema,
      },
    ]),
    BidsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
