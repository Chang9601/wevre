import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Schema as MongooseSchema } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { User } from '../../entities/user.entity';
import { MongoDbErrorCode } from '../../databases/mongodb-error-code.enum';
import { CreateUserDto } from '../../dtos/create-user.dto';

export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly usersModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
      const roles = [createUserDto.role];

      const user = new this.usersModel({
        ...createUserDto,
        password: hashedPassword,
        roles: roles,
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
  ): Promise<User> {
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

  async findOne(filter: FilterQuery<User>): Promise<User> {
    try {
      const user = this.usersModel.findOne(filter).lean();

      if (!user) {
        throw new NotFoundException('사용자 없음.');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('사용자 검색 중 오류 발생.');
    }
  }
}
