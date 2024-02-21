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
import { PageDto } from '../../dtos/page.dto';
import { ItemsDto } from '../../dtos/items.dto';
import { ItemDto } from '../../dtos/item.dto';
import { Item } from '../../entities/item.entity';
import { ItemsService } from './items.service';
import { ParseObjectIdPipe } from '../../pipes/parse-object-id.pipe';
import { HttpCacheInterceptor } from '../../interceptors/cache.interceptor';
import { Serialize } from '../../interceptors/serialize.interceptor';
import { buildFilter } from '../../common/factories/common.factory';

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
  async getItems(
    @Query() paginationDto: PaginationDto,
  ): Promise<PageDto<Item>> {
    return await this.itemsService.find(paginationDto);
  }

  @ApiNotFoundResponse({
    description: '존재하지 않는 상품.',
  })
  @ApiOkResponse({
    type: ItemDto,
    description: '상품 검색 성공.',
  })
  @HttpCode(HttpStatus.OK)
  // 직렬화 시 스키마 관련 오류 발생.
  // TypeError: Cannot read properties of undefined (reading 'tree')
  // @Serialize(ItemDto)
  @Get('/:id')
  async getItem(
    @Param('id', ParseObjectIdPipe) _id: MongooseSchema.Types.ObjectId,
  ): Promise<Item> {
    const filter = buildFilter('_id', _id);

    return await this.itemsService.findOne(filter);
  }
}
