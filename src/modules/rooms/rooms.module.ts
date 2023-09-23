import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RoomsService } from './rooms.service';
import { Room, RoomSchema } from '../../entities/room.entity';
import { RoomsRepository } from './rooms.repository';
import { ItemsModule } from '../items/items.module';
import { Message, MessageSchema } from '../../entities/message.entity';
import { UsersModule } from '../users/users.module';
import { Item, ItemSchema } from '../../entities/item.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Room.name, schema: RoomSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Item.name, schema: ItemSchema },
    ]),
    UsersModule,
    ItemsModule,
  ],
  providers: [RoomsService, RoomsRepository],
  exports: [RoomsService],
})
export class RoomsModule {}
