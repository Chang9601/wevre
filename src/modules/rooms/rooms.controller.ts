import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { Schema as MongooseSchema } from 'mongoose';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CacheKey } from '@nestjs/cache-manager';

import { RoomsService } from './rooms.service';
import { ParseObjectIdPipe } from '../../pipes/parse-object-id.pipe';
import { buildFilter } from '../../common/factories/common.factory';
import { HttpCacheInterceptor } from '../../interceptors/cache.interceptor';

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @ApiNotFoundResponse({
    description: '존재하지 않는 경매방.',
  })
  @ApiOkResponse({
    description: '경매방 검색 성공.',
  })
  @HttpCode(HttpStatus.OK)
  @CacheKey('items')
  @UseInterceptors(HttpCacheInterceptor)
  @Get('/:id')
  async getRoom(
    @Param('id', ParseObjectIdPipe) id: MongooseSchema.Types.ObjectId,
  ) {
    const filter = buildFilter('item._id', id);

    return await this.roomsService.findOne(filter);
  }
}
