import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcryptjs';
import { Schema as MongooseSchema } from 'mongoose';

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

  async findByEmail(email: string) {
    const user = await this.usersRepository.findByEmail(email);

    return user;
  }

  async findById(id: MongooseSchema.Types.ObjectId) {
    const user = await this.usersRepository.findById(id);

    return user;
  }
}
