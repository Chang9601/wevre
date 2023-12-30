import { InjectModel } from '@nestjs/mongoose';
import {
  Inject,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { Model, Schema as MongooseSchema } from 'mongoose';

import { Message } from '../../entities/message.entity';
import { RoomsRepository } from '../rooms/rooms.repository';
import { UsersRepository } from '../users/users.repository';
import { Bid } from './interfaces/bid.interface';

export class BidsRepository {
  constructor(
    private readonly usersResitory: UsersRepository,
    @Inject(forwardRef(() => RoomsRepository))
    private readonly roomsRepository: RoomsRepository,
    @InjectModel(Message.name) private readonly messagesModel: Model<Message>,
  ) {}

  async findOne(id: MongooseSchema.Types.ObjectId) {
    try {
      const room = await this.roomsRepository.findByItemId(id);

      if (!room) {
        throw new NotFoundException('아이디에 해당하는 경매방 없음.');
      }

      const bid = await this.messagesModel
        .findOne({ room: room })
        .sort({ content: -1 })
        .collation({ locale: 'en_US', numericOrdering: true });

      const highestBid: Bid = {
        price: 0,
        userId: undefined,
        roomId: undefined,
      };

      if (!bid) {
        return highestBid;
      }

      const user = await this.usersResitory.findById(bid.user._id);

      highestBid.id = bid._id;
      highestBid.price = Number(bid.content);
      highestBid.name = user.name;
      highestBid.email = user.email;

      return highestBid;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('최고 입찰가 검색 중 오류 발생.');
    }
  }
}
