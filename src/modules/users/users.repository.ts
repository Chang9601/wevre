import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../entities/user.entity';
import { Model } from 'mongoose';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Schema as MongooseSchema } from 'mongoose';

export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly usersModel: Model<User>,
  ) {}

  async create(name: string, email: string, password: string) {
    let user = await this.findByEmail(email);

    if (user) {
      throw new ConflictException('User with this email already exists.');
    }

    try {
      user = new this.usersModel({
        name,
        email,
        password,
      });

      user = await user.save();
      return user._id;
    } catch (error) {
      throw new InternalServerErrorException('Error while saving user.');
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      return await this.usersModel.findOne({ email });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while finding user by email.',
      );
    }
  }
  async findById(_id: MongooseSchema.Types.ObjectId): Promise<User> {
    try {
      return await this.usersModel.findOne({ _id });
    } catch (error) {
      throw new InternalServerErrorException('Error while finding user by id.');
    }
  }
}
