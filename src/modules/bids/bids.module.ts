import { MongooseModule } from '@nestjs/mongoose';
import { Module, forwardRef } from '@nestjs/common';

import { BidsGateway } from './bids.gateway';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { RoomsModule } from '../rooms/rooms.module';
import { BidsService } from './bids.service';
import { BidsRepository } from './bids.repository';
import { BidsController } from './bids.contoller';
import { Message, MessageSchema } from '../../entities/message.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    UsersModule,
    AuthModule,
    forwardRef(() => RoomsModule),
  ],
  controllers: [BidsController],
  providers: [BidsGateway, BidsService, BidsRepository],
  exports: [BidsRepository],
})
export class BidsModule {}
