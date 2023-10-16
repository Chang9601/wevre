import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { Schema as MongooseSchema } from 'mongoose';

import { ItemsService } from './items.service';
import { ItemPaginationDto } from '../../dtos/item-pagination.dto';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get('/')
  @HttpCode(HttpStatus.OK)
  async getItems(@Query() itemPaginationDto: ItemPaginationDto) {
    const { limit, skip, search, sort } = itemPaginationDto;

    return await this.itemsService.find(limit, skip, search, sort);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getItem(@Param('id') id: MongooseSchema.Types.ObjectId) {
    return await this.itemsService.findOne(id);
  }
}
