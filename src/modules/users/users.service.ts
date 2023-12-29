import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Schema as MongooseSchema } from 'mongoose';

import { UsersRepository } from './users.repository';
import { User } from '../../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(name: string, email: string, password: string) {
    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      return this.usersRepository.create(name, email, hashedPassword);
    } catch (error) {
      throw new InternalServerErrorException('비밀번호 해시 중 오류 발생.');
    }
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
      const user = await this.findById(id);

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

  async findByEmail(email: string) {
    return await this.usersRepository.findByEmail(email);
  }

  async findById(id: MongooseSchema.Types.ObjectId) {
    return await this.usersRepository.findById(id);
  }
}
