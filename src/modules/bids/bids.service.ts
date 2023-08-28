import { Injectable } from '@nestjs/common';
import { Schema as MongooseSchema } from 'mongoose';

import { PaginationDto } from '../../dtos/pagination.dto';
import { MakeBidDto } from '../../dtos/make-bid.dto';
import { User } from '../../entities/user.entity';
import { BidsRepository } from './bids.repository';
import { ItemsRepository } from '../items/items.repository';
import { RoomsRepository } from '../rooms/rooms.repository';
import { UsersRepository } from '../users/users.repository';
import { buildFilter } from '../../common/factories/common.factory';

@Injectable()
export class BidsService {
  constructor(
    private readonly bidsRepository: BidsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly itemsRepository: ItemsRepository,
    private readonly roomsRepository: RoomsRepository,
  ) {}

  async create(makeBidDto: MakeBidDto) {
    const { price, userId, itemId, roomId } = makeBidDto;

    const userFilter = buildFilter('_id', userId);
    const roomFilter = buildFilter('_id', roomId);

    const user = await this.usersRepository.findOne(userFilter);
    const item = await this.itemsRepository.findOne(itemId);
    const room = await this.roomsRepository.findOne(roomFilter);

    return await this.bidsRepository.create(price, user, item, room);
  }

  async findOne(id: MongooseSchema.Types.ObjectId) {
    return await this.bidsRepository.findOne(id);
  }

  async find(paginationDto: PaginationDto, user: User) {
    return await this.bidsRepository.find(paginationDto, user);
  }
}
