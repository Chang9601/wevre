import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Schema as MongooseSchema } from 'mongoose';

import { UsersService } from '../users/users.service';
import { TokenPayload } from './interfaces/token-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(name: string, email: string, password: string) {
    return this.usersService.create(name, email, password);
  }

  async validate(email: string, password: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        throw new BadRequestException();
      }

      return user;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw new BadRequestException(
          '유효하지 않은 이메일 혹은 유효하지 않은 비밀번호.',
        );
      }

      throw new InternalServerErrorException(
        '이메일과 비밀번호로 인증 중 오류 발생.',
      );
    }
  }

  async createToken(id: MongooseSchema.Types.ObjectId) {
    try {
      const payload: TokenPayload = { id };
      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_TOKEN_EXPIRATION',
        ),
      });

      return { accessToken };
    } catch (error) {
      throw new InternalServerErrorException('접근 토큰 생성 중 오류 발생.');
    }
  }

  async createRefreshToken(id: MongooseSchema.Types.ObjectId) {
    try {
      const payload: TokenPayload = { id };
      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_TOKEN_EXPIRATION',
        ),
      });

      return { refreshToken };
    } catch (error) {
      throw new InternalServerErrorException(
        '새로고침 토큰 생성 중 오류 발생.',
      );
    }
  }

  async verifyToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      });

      return payload;
    } catch (error) {
      throw new InternalServerErrorException(
        '접근 토큰으로 인증 중 오류 발생.',
      );
    }
  }
}
