import { InjectModel } from '@nestjs/mongoose';
import {
  InternalServerErrorException,
  //NotFoundException,
} from '@nestjs/common';
import { Model, Schema as MongooseSchema } from 'mongoose';

import { Message } from '../../entities/message.entity';
import { RoomsRepository } from '../rooms/rooms.repository';
import { UsersRepository } from '../users/users.repository';

export class BidsRepository {
  constructor(
    private readonly usersResitory: UsersRepository,
    private readonly roomsRepository: RoomsRepository,
    @InjectModel(Message.name) private readonly messagesModel: Model<Message>,
  ) {}

  async findOne(id: MongooseSchema.Types.ObjectId) {
    try {
      const room = await this.roomsRepository.findByItemId(id);

      if (!room) {
        return null;
      }

      const bid = await this.messagesModel
        .findOne({ room: room })
        .sort({ content: -1 });

      const user = await this.usersResitory.findById(bid.user._id);

      const highestBid = {
        price: bid.content,
        name: user.name,
        email: user.email,
      };

      return highestBid;
    } catch (error) {
      // if (error instanceof NotFoundException) {
      //   throw error;
      // }

      throw new InternalServerErrorException('Error finding the highest bid.');
    }
  }
}
