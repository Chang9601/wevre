import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Schema as MongooseSchema } from 'mongoose';

import { UsersService } from '../users/users.service';
import TokenPayload from './interfaces/token-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(name: string, email: string, password: string) {
    return this.usersService.create(name, email, password);
  }

  async findOne(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }

    throw new UnauthorizedException(
      'Authentication failed. Invalid email or password.',
    );
  }

  async signin(id: MongooseSchema.Types.ObjectId) {
    const payload: TokenPayload = { id };
    const token = this.jwtService.sign(payload);

    return { token };
  }

  async verifyToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      return payload;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while verifying JWT token.',
      );
    }
  }
}
