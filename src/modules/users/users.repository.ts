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

  async createUser(name: string, email: string, password: string) {
    let user = await this.findByEmail(email);

    if (user) {
      throw new ConflictException('User with this email already exists.');
    }

    user = new this.usersModel({
      name,
      email,
      password,
    });

    try {
      user = await user.save();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }

    return user._id;
  }

  async findByEmail(email: string): Promise<User> {
    let user: User;

    try {
      user = await this.usersModel.findOne({ email });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }

    return user;
  }
}
