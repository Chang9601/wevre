import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Schema as MongooseSchema } from 'mongoose';

import { User } from '../../entities/user.entity';

export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly usersModel: Model<User>,
  ) {}

  async create(name: string, email: string, password: string) {
    try {
      let user = await this.findByEmail(email);

      if (user) {
        throw new ConflictException('User with this email already exists.');
      }

      user = new this.usersModel({
        name,
        email,
        password,
      });

      user = await user.save();
      return user._id;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Error saving user.');
      }
    }
  }

  async update(
    _id: MongooseSchema.Types.ObjectId,
    updateUserDto: Partial<User>,
  ) {
    try {
      const updatedUser = await this.usersModel.findByIdAndUpdate(
        { _id },
        updateUserDto,
        { new: true },
      );

      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException('Error updating user.');
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      return await this.usersModel.findOne({ email });
    } catch (error) {
      throw new InternalServerErrorException('Error finding user by email.');
    }
  }
  async findById(_id: MongooseSchema.Types.ObjectId): Promise<User> {
    try {
      return await this.usersModel.findOne({ _id });
    } catch (error) {
      throw new InternalServerErrorException('Error finding user by id.');
    }
  }
}
