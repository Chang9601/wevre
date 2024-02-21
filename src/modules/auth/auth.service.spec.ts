import * as crypto from 'crypto';

import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ObjectId } from 'mongodb';
import * as bcrypt from 'bcryptjs';

import { CreateUserDto } from '../../dtos/create-user.dto';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Role } from '../../common/enums/common.enum';

const createUserDto: CreateUserDto = {
  name: '사용자',
  email: 'user@gmail.com',
  password: '1234',
  role: Role.USER,
};

const mockUser = {
  _id: new ObjectId(),
  name: createUserDto.name,
  email: createUserDto.email,
  password: crypto.randomBytes(Math.ceil(10)).toString('hex'),
  role: createUserDto.role,
};

describe('AuthService', () => {
  let authService: AuthService;
  let usersSerivce: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockUser),
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
            signAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersSerivce = module.get<UsersService>(UsersService);
  });

  it('should be defined.', () => {
    expect(authService).toBeDefined();
  });

  describe('signUp', () => {
    it('should sign up a user.', async () => {
      const user = await authService.signUp(createUserDto);

      expect(user._id).toBeDefined();
      expect(user.password).not.toBe(createUserDto.password);
    });
  });

  describe('validateCredentials', () => {
    it('should validate credentials of a user.', async () => {
      const salt = await bcrypt.genSalt();

      jest.spyOn(usersSerivce, 'findOne').mockResolvedValueOnce({
        ...mockUser,
        password: await bcrypt.hash(createUserDto.password, salt),
      } as any);

      const { email, password } = createUserDto;
      const user = await authService.validateCredentials(email, password);

      expect(user._id).toBe(mockUser._id);
      expect(user.name).toBe(mockUser.name);
    });

    it('should throw BadRequestException for invalid credentials.', async () => {
      jest
        .spyOn(usersSerivce, 'findOne')
        .mockResolvedValueOnce(mockUser as any);

      const { email, password } = mockUser;

      await expect(
        authService.validateCredentials(email, password),
      ).rejects.toThrowError(BadRequestException);
    });
  });

  // OAuth 2.0 로그인은 어떻게 구현?

  afterEach(() => {
    jest.clearAllMocks();
  });
});
