import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RoomsService } from './rooms.service';
import { Room, RoomSchema } from '../../entities/room.entity';
import { RoomsRepository } from './rooms.repository';
import { ItemsModule } from '../items/items.module';
import { Message, MessageSchema } from '../../entities/message.entity';
import { UsersModule } from '../users/users.module';
import { Item, ItemSchema } from '../../entities/item.entity';
import { RoomsController } from './rooms.controller';
import { BidsModule } from '../bids/bids.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Room.name, schema: RoomSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Item.name, schema: ItemSchema },
    ]),
    UsersModule,
    ItemsModule,
    forwardRef(() => BidsModule),
  ],
  controllers: [RoomsController],
  providers: [RoomsService, RoomsRepository],
  exports: [RoomsService, RoomsRepository],
})
export class RoomsModule {}
