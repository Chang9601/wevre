import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { User } from '../../entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

const name = '박선심';
const email = 'sunshim@naver.com';
const password = '12341234aA!';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: Partial<UsersRepository>;
  let jwtService: {
    sign: (payload: { email: string }) => string;
  };

  beforeEach(async () => {
    const users: User[] = [];

    usersRepository = {
      createUser: async (name: string, email: string, password: string) => {
        let user = users.find((user) => user.email === email);

        if (user) {
          throw new ConflictException('User with this email already exists.');
        }

        user = {
          id: uuidv4(),
          name: name,
          email: email,
          password: password,
        } as User;
        users.push(user);

        return user;
      },
      findByEmail: async (email: string) => {
        return users.find((user) => user.email === email);
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

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const user = await service.createUser(name, email, password);

    expect(user).toHaveProperty('id');
    expect(user.password).not.toEqual(password);
    expect(user.name).toEqual(name);
  });

  it('should throw a ConflictException error with a duplicate user', async () => {
    await service.createUser(name, email, password);
    await expect(
      service.createUser(name, email, password),
    ).rejects.toThrowError(ConflictException);
  });

  it('should return an access token after finding a user by email', async () => {
    await service.createUser(name, email, password);
    const result = await service.signin(email, password);

    expect(result.accessToken).toBeDefined();
  });
});
