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
import { PaginationDto } from '../../dtos/pagination.dto';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get('/')
  @HttpCode(HttpStatus.OK)
  async getItems(@Query() paginationDto: PaginationDto) {
    return await this.itemsService.find(paginationDto);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getItem(@Param('id') id: MongooseSchema.Types.ObjectId) {
    return await this.itemsService.findOne(id);
  }
}
