import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { User } from '../../entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

const name = '박선심';
const email = 'sunshim@naver.com';
const password = '12341234aA!';

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: Partial<UsersRepository>;
  let jwtService: {
    sign: (payload: { email: string }) => string;
  };

  beforeEach(async () => {
    const users: User[] = [];

    usersRepository = {
      create: async (name: string, email: string, password: string) => {
        let user = users.find((user) => user.email === email);

        if (user) {
          throw new ConflictException('User with this email already exists.');
        }
        try {
          user = {
            id: uuidv4(),
            name: name,
            email: email,
            password: password,
          } as User;
          users.push(user);

          return user;
        } catch (error) {
          throw new InternalServerErrorException('Error while saving a user.');
        }
      },
      findOne: async (email: string) => {
        try {
          return users.find((user) => user.email === email);
        } catch (error) {
          throw new InternalServerErrorException(
            'Error while find a user by email.',
          );
        }
      },
    };
    jwtService = {
      sign: (payload: { email: string }) => {
        return payload.email + uuidv4();
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: usersRepository,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  it('should create a user', async () => {
    const user = await usersService.create(name, email, password);

    expect(user).toHaveProperty('id');
    expect(user.password).not.toEqual(password);
    expect(user.name).toEqual(name);
  });

  it('should throw ConflictException with a duplicate user', async () => {
    await usersService.create(name, email, password);
    await expect(
      usersService.create(name, email, password),
    ).rejects.toThrowError(ConflictException);
  });

  it('should return an access token after finding a user by email', async () => {
    await usersService.create(name, email, password);
    const result = await usersService.signin(email, password);

    expect(result.accessToken).toBeDefined();
  });
});
