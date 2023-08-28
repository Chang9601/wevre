import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import TokenPayload from './interfaces/tokenPayload.interface';
import { Schema as MongooseSchema } from 'mongoose';

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
}
