import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(name: string, email: string, password: string) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    return this.usersRepository.createUser(name, email, hashedPassword);
  }

  async signin(email: string, password: string) {
    const user = await this.usersRepository.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { email };
      const accessToken = this.jwtService.sign(payload);

      return { accessToken };
    }

    throw new UnauthorizedException(
      'Authentication failed. Invalid email or password.',
    );
  }
}
