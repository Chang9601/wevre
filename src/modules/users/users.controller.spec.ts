import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';

const createUserDto = {
  name: '박선심',
  email: 'sunshim@naver.com',
  password: '12341234aA!',
};

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];

    usersService = {
      createUser: async (name: string, email: string, password: string) => {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = {
          id: uuidv4(),
          name: name,
          email: email,
          password: hashedPassword,
        } as User;
        users.push(user);

        return user;
      },
      signin: async (email: string, password: string) => {
        const user = users.find((user) => user.email === email);

        if (user && (await bcrypt.compare(password, user.password))) {
          return { accessToken: 'accessToken' };
        }

        throw new UnauthorizedException(
          'Authentication failed. Invalid email or password.',
        );
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a user', async () => {
    const user = await controller.createUser(createUserDto);

    expect(user).toHaveProperty('id');
    expect(user.password).not.toEqual(createUserDto.password);
  });

  it('should signin a user', async () => {
    await controller.createUser(createUserDto);
    const result = await controller.signin({
      email: createUserDto.email,
      password: createUserDto.password,
    });

    expect(result.accessToken).toBeDefined();
  });

  it('should throw an Unauthorized exception with an invalid email', async () => {
    await controller.createUser(createUserDto);

    await expect(
      controller.signin({
        email: 'unknown@naver.com',
        password: createUserDto.password,
      }),
    ).rejects.toThrowError(UnauthorizedException);
  });

  it('should throw an Unauthorized exception with an invalid password', async () => {
    await controller.createUser(createUserDto);

    await expect(
      controller.signin({ email: createUserDto.email, password: '1234' }),
    ).rejects.toThrowError(UnauthorizedException);
  });

  it('should throw an Unauthorized exception with an invalid email and invalid password', async () => {
    await controller.createUser(createUserDto);

    await expect(
      controller.signin({ email: 'unknown@naver.com', password: '1234' }),
    ).rejects.toThrowError(UnauthorizedException);
  });
});
