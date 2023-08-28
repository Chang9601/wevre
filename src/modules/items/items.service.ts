import { Injectable } from '@nestjs/common';
import { Schema as MongooseSchema } from 'mongoose';

import { ItemsRepository } from './items.repository';
import { PaginationDto } from '../../dtos/pagination.dto';

@Injectable()
export class ItemsService {
  constructor(private readonly itemsRepository: ItemsRepository) {}

  async find(paginationDto: PaginationDto) {
    return await this.itemsRepository.find(paginationDto);
  }

  async findOne(id: MongooseSchema.Types.ObjectId) {
    return await this.itemsRepository.findOne(id);
  }
}
