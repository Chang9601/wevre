import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RoomsService } from './rooms.service';
import { Room, RoomSchema } from '../../entities/room.entity';
import { RoomsRepository } from './rooms.repository';
import { Bid, BidSchema } from '../../entities/bid.entity';
import { Item, ItemSchema } from '../../entities/item.entity';
import { RoomsController } from './rooms.controller';
import { BidsModule } from '../bids/bids.module';
import { ItemsModule } from '../items/items.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Room.name, schema: RoomSchema },
      { name: Bid.name, schema: BidSchema },
      { name: Item.name, schema: ItemSchema },
    ]),
    ItemsModule,
    forwardRef(() => BidsModule),
  ],
  controllers: [RoomsController],
  providers: [RoomsService, RoomsRepository],
  exports: [RoomsService, RoomsRepository],
})
export class RoomsModule {}
