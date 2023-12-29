import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { Schema as MongooseSchema } from 'mongoose';

import { BidsService } from './bids.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bids')
//@UseGuards(JwtAuthGuard)
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getHighestBid(@Param('id') id: MongooseSchema.Types.ObjectId) {
    return await this.bidsService.findOne(id);
  }
}
