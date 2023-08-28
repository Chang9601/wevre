import { MongooseModule } from '@nestjs/mongoose';
import { Module, forwardRef } from '@nestjs/common';

import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { RoomsModule } from '../rooms/rooms.module';
import { ItemsModule } from '../items/items.module';
import { BidsController } from './bids.contoller';
import { BidsGateway } from './bids.gateway';
import { BidsService } from './bids.service';
import { BidsRepository } from './bids.repository';
import { Bid, BidSchema } from '../../entities/bid.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Bid.name, schema: BidSchema }]),
    UsersModule,
    AuthModule,
    ItemsModule,
    // 순환 의존성을 방지하기 위해 전방 참조를 사용한다.
    forwardRef(() => RoomsModule),
  ],
  controllers: [BidsController],
  providers: [BidsGateway, BidsService, BidsRepository],
  exports: [BidsRepository],
})
export class BidsModule {}
