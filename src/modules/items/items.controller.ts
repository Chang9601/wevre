import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { Schema as MongooseSchema } from 'mongoose';
import { PaginationDto } from '../../dtos/pagination.dto';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get('/')
  @HttpCode(HttpStatus.OK)
  async getAllItems(@Query() paginationDto: PaginationDto) {
    const { limit, skip, search, sort } = paginationDto;

    return await this.itemsService.find(limit, skip, search, sort);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getItem(@Param('id') id: MongooseSchema.Types.ObjectId) {
    return await this.itemsService.findOne(id);
  }
}
