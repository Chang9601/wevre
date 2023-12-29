import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Schema as MongooseSchema } from 'mongoose';

import { User } from '../../entities/user.entity';
import { MongoDbErrorCode } from 'src/database/mongodb-error-code.enum';

export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly usersModel: Model<User>,
  ) {}

  async create(name: string, email: string, password: string): Promise<User> {
    try {
      const user = new this.usersModel({
        name,
        email,
        password,
      });

      return await user.save();
    } catch (error) {
      if (error?.code === MongoDbErrorCode.DUPLICATE_KEY) {
        throw new ConflictException('이메일 사용 중.');
      }
      throw new InternalServerErrorException('사용자 생성 중 오류 발생.');
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
      throw new InternalServerErrorException('사용자 갱신 중 오류 발생.');
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      const user = await this.usersModel.findOne({ email });
      if (!user) {
        throw new NotFoundException('이메일에 해당하는 사용자 없음.');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        '이메일로 사용자 검색 중 오류 발생.',
      );
    }
  }

  async findById(_id: MongooseSchema.Types.ObjectId): Promise<User> {
    try {
      const user = await this.usersModel.findOne({ _id });
      if (!user) {
        throw new NotFoundException('아이디에 해당하는 사용자 없음.');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        '아이디로 사용자 검색 중 오류 발생.',
      );
    }
  }
}
