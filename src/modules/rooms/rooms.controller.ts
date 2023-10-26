import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { Schema as MongooseSchema } from 'mongoose';

import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getRoom(@Param('id') itemId: MongooseSchema.Types.ObjectId) {
    return await this.roomsService.findByItemId(itemId);
  }
}
