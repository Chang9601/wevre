import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { FilterQuery, Schema as MongooseSchema } from 'mongoose';

import { UsersRepository } from './users.repository';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from '../../dtos/create-user.dto';
import { buildFilter } from 'src/common/factories/common.factory';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto) {
    return await this.usersRepository.create(createUserDto);
  }

  async update(
    id: MongooseSchema.Types.ObjectId,
    updateUserDto: Partial<User>,
  ) {
    try {
      return this.usersRepository.update(id, updateUserDto);
    } catch (error) {
      throw new InternalServerErrorException('사용자 갱신 중 오류 발생.');
    }
  }

  async setRefreshToken(
    refreshToken: string,
    id: MongooseSchema.Types.ObjectId,
  ) {
    try {
      const salt = await bcrypt.genSalt();
      const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);

      await this.usersRepository.update(id, {
        refreshToken: hashedRefreshToken,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        '새로고침 토큰 설정 중 오류 발생.',
      );
    }
  }

  async removeRefreshToken(id: MongooseSchema.Types.ObjectId) {
    try {
      await this.usersRepository.update(id, { refreshToken: null });
    } catch (error) {
      throw new InternalServerErrorException(
        '새로고침 토큰 삭제 중 오류 발생.',
      );
    }
  }

  async findByRefreshToken(
    refreshToken: string,
    id: MongooseSchema.Types.ObjectId,
  ) {
    try {
      const filter = buildFilter('_id', id);
      const user = await this.findOne(filter);

      const refreshTokenMatch = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );

      if (!refreshTokenMatch) {
        throw new NotFoundException('새로고침 토큰 불일치.');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        '새로고침 토큰으로 사용자 검색 중 오류 발생.',
      );
    }
  }

  async findOne(filter: FilterQuery<User>) {
    return await this.usersRepository.findOne(filter);
  }
}
