import { Module } from '@nestjs/common';
import { BidsGateway } from './bids.gateway';

@Module({
  providers: [BidsGateway],
})
export class BidsModule {}
