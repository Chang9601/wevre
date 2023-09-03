import { Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { Schema as MongooseSchema } from 'mongoose';

import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post('/items/:id')
  @HttpCode(HttpStatus.CREATED)
  async createRoom(@Param('id') id: MongooseSchema.Types.ObjectId) {
    const roomId = await this.roomsService.create(id);

    return roomId;
  }
}
