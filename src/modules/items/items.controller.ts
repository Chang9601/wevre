import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { Schema as MongooseSchema } from 'mongoose';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { PaginationDto } from '../../dtos/pagination.dto';
import { ItemsDto } from '../../dtos/items.dto';
import { Item } from '../../entities/item.entity';
import { ItemsService } from './items.service';
import { Serialize } from '../../interceptors/serialize.interceptor';
import { ParseObjectIdPipe } from '../../pipes/parse-object-id.pipe';
import { HttpCacheInterceptor } from '../../interceptors/cache.interceptor';

@ApiTags('items')
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @ApiNotFoundResponse({
    description: '빈 상품 목록.',
  })
  @ApiOkResponse({
    type: ItemsDto,
    description: '상품 목록 검색 성공.',
  })
  @ApiQuery({
    type: PaginationDto,
  })
  @HttpCode(HttpStatus.OK)
  @Serialize(ItemsDto)
  @UseInterceptors(HttpCacheInterceptor)
  @Get('')
  async getItems(@Query() paginationDto: PaginationDto) {
    return await this.itemsService.find(paginationDto);
  }

  @ApiNotFoundResponse({
    description: '존재하지 않는 상품.',
  })
  @ApiOkResponse({
    type: Item,
    description: '상품 검색 성공.',
  })
  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  async getItem(
    @Param('id', ParseObjectIdPipe) id: MongooseSchema.Types.ObjectId,
  ) {
    return await this.itemsService.findOne(id);
  }
}
