import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../entities/user.entity';
import { Model } from 'mongoose';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly usersModel: Model<User>,
  ) {}

  async create(name: string, email: string, password: string) {
    let user = await this.findOne(email);

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

  async findOne(email: string): Promise<User> {
    try {
      return await this.usersModel.findOne({ email });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while finding user by email.',
      );
    }
  }
}
