import { Module } from '@nestjs/common';

import { BidsGateway } from './bids.gateway';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { RoomsModule } from '../rooms/rooms.module';
import { SocketIoAdapter } from './adapters/socket.adapter';

@Module({
  imports: [UsersModule, AuthModule, RoomsModule],
  providers: [BidsGateway, SocketIoAdapter],
})
export class BidsModule {}
