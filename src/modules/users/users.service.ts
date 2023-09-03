import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Schema as MongooseSchema } from 'mongoose';

import { UsersRepository } from './users.repository';
import { User } from '../../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(name: string, email: string, password: string) {
    try {
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);

      return this.usersRepository.create(name, email, hashedPassword);
    } catch (error) {
      throw new InternalServerErrorException('Error while hashing password.');
    }
  }

  async update(
    id: MongooseSchema.Types.ObjectId,
    updateUserDto: Partial<User>,
  ) {
    return this.usersRepository.update(id, updateUserDto);
  }

  async findByEmail(email: string) {
    const user = await this.usersRepository.findByEmail(email);

    return user;
  }

  async findById(id: MongooseSchema.Types.ObjectId) {
    const user = await this.usersRepository.findById(id);

    return user;
  }
}
