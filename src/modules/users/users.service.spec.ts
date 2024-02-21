import * as crypto from 'crypto';

import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Schema as MongooseSchema, Query } from 'mongoose';
import { ObjectId } from 'mongodb';
import { createMock } from '@golevelup/ts-jest';
import * as bcrypt from 'bcryptjs';

import { CreateUserDto } from '../../dtos/create-user.dto';
import { OAuthProfileDto } from '../../dtos/oauth-profile.dto';
import { User } from '../../entities/user.entity';
import { UsersService } from './users.service';
import { OAuthProvider, Role } from '../../common/enums/common.enum';
import { buildFilter } from '../../common/factories/common.factory';

const createUserDto: CreateUserDto = {
  name: '사용자',
  email: 'user@gmail.com',
  password: '1234',
  role: Role.USER,
};

const oAuthProfileDto: Partial<OAuthProfileDto> = {
  name: '사용자',
  email: 'user@gmail.com',
  oAuthProvider: OAuthProvider.GOOGLE,
  oAuthProviderId: '141231155934',
  role: Role.USER,
};

const mockUser = {
  _id: new ObjectId(),
  name: createUserDto.name,
  email: createUserDto.email,
  password: crypto.randomBytes(Math.ceil(10)).toString('hex'),
  refreshToken: 'ljjhbkhjbh79ggbj6',
  role: createUserDto.role,
};

const mockOAuthUser = {
  _id: new ObjectId(),
  name: oAuthProfileDto.name,
  email: oAuthProfileDto.email,
  password: crypto.randomBytes(Math.ceil(10)).toString('hex'),
  oAuthProvider: oAuthProfileDto.oAuthProvider,
  oAuthProviderId: oAuthProfileDto.oAuthProviderId,
  role: oAuthProfileDto.role,
};

describe('UsersService', () => {
  let usersService: UsersService;
  let usersModel: Model<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          // Mongoose 모델을 나타내는 토큰을 생성한다.
          // 토큰은 NestJS의 의존성 주입 시스템에서 사용되어 요청 시 올바른 모델을 식별하고 해결한다.
          provide: getModelToken('User'),
          useValue: {
            create: jest.fn(),
            findOneAndUpdate: jest.fn(),
            findOne: jest.fn(),
            exists: jest.fn(),
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersModel = module.get<Model<User>>(getModelToken('User'));
  });

  it('should be defined.', () => {
    expect(usersService).toBeDefined();
  });

  describe('create', () => {
    it('should create a user.', async () => {
      // spyOn() 메서드는 목표 메서드에 대한 호출을 추적하며 나중에 얼마나 자주 호출되었는지 및 어떤 인자와 함께 호출되었는지와 같은 것들을 확인할 수 있다.
      // mockImplementationOnce() 메서드는 목표 메서드에 대한 모의(mock) 구현을 제공한다.
      // 즉, 실제 목표 메서드를 호출하는 대신에 모의 함수를 호출한다.
      // 테스트를 실제 데이터베이스나 다른 의존성으로부터 격리시키는 데 유용하다.
      jest.spyOn(usersModel, 'create').mockImplementationOnce(
        () =>
          Promise.resolve({
            mockUser,
            save: () => mockUser,
          }) as any,
      );

      const user = await usersService.create(createUserDto);

      expect(user._id).toBeDefined();
      expect(user.name).toBe(createUserDto.name);
      expect(user.email).toBe(createUserDto.email);
      expect(user.password).not.toBe(createUserDto.password);
    });

    it('should throw ConflictException error for a duplicate email.', async () => {
      // mockRejectedValueOnce() 메서드는 jest.fn().mockImplementationOnce(() => Promise.reject(value))의 설탕 함수.
      jest
        .spyOn(usersModel, 'create')
        .mockRejectedValueOnce(new ConflictException());

      await expect(usersService.create(createUserDto)).rejects.toThrowError(
        ConflictException,
      );
    });
  });

  describe('createWithOAuth', () => {
    it('should create a user with OAuth 2.0 profile.', async () => {
      jest.spyOn(usersModel, 'create').mockImplementationOnce(
        () =>
          Promise.resolve({
            mockOAuthUser,
            // save() 메서드를 호출하기 때문에 필요하다.
            save: () => mockOAuthUser,
          }) as any,
      );

      const user = await usersService.createWithOAuth(
        oAuthProfileDto as OAuthProfileDto,
      );

      expect(user._id).toBeDefined();
      expect(user.password).not.toBe(oAuthProfileDto.password);
      expect(user.oAuthProvider).toBe(oAuthProfileDto.oAuthProvider);
      expect(user.oAuthProviderId).toBe(oAuthProfileDto.oAuthProviderId);
    });
  });

  describe('update', () => {
    it('should update the email of a user.', async () => {
      const email = 'manager@naver.com';

      // mockResolvedValueOnce() 메서드는 jest.fn().mockImplementationOnce(() => Promise.resolve(value))의 설탕 함수.
      jest.spyOn(usersModel, 'findOneAndUpdate').mockResolvedValueOnce({
        ...mockUser,
        email,
      });

      const _id: unknown = mockUser._id;
      const filter = buildFilter('_id', _id as MongooseSchema.Types.ObjectId);
      const user = await usersService.update(filter, {
        email,
      });

      expect(user.email).toBe(email);
    });

    it('should set the refresh token of a user.', async () => {
      const salt = await bcrypt.genSalt();
      const refreshToken = '561jnjlnk898hoh9';

      jest.spyOn(usersModel, 'findOneAndUpdate').mockResolvedValueOnce({
        ...mockUser,
        refreshToken: await bcrypt.hash(refreshToken, salt),
      });

      const _id: unknown = mockUser._id;
      const user = await usersService.setRefreshToken(
        _id as MongooseSchema.Types.ObjectId,
        refreshToken,
      );

      expect(user.refreshToken).not.toBe(mockUser.refreshToken);
    });

    it('should remove the refresh token of a user.', async () => {
      // mockResolvedValueOnce() 메서드는 jest.fn().mockImplementationOnce(() => Promise.resolve(value))의 설탕 함수.
      jest.spyOn(usersModel, 'findOneAndUpdate').mockResolvedValueOnce({
        ...mockUser,
        refreshToken: null,
      });

      const _id: unknown = mockUser._id;
      const user = await usersService.removeRefreshToken(
        _id as MongooseSchema.Types.ObjectId,
      );

      expect(user.refreshToken).toBe(null);
    });
  });

  describe('findOne', () => {
    it('should find a user.', async () => {
      const email = mockOAuthUser.email;

      // mockReturnValueOnce() 메서드는 특정 함수 호출의 반환 값을 모의한다.
      jest.spyOn(usersModel, 'findOne').mockReturnValueOnce(
        createMock<Query<User, User>>({
          lean: jest.fn().mockResolvedValueOnce(mockOAuthUser),
        }),
      );

      const filter = buildFilter('email', email);
      const user = await usersService.findOne(filter);

      expect(user._id).toBe(mockOAuthUser._id);
      expect(user.password).toBe(mockOAuthUser.password);
      expect(user.name).toBe(mockOAuthUser.name);
    });

    it('should find a user by the refresh token.', async () => {
      const salt = await bcrypt.genSalt();
      const refreshToken = '561jnjlnk898hoh9';

      jest.spyOn(usersModel, 'findOne').mockReturnValueOnce(
        createMock<Query<User, User>>({
          lean: jest.fn().mockResolvedValueOnce({
            ...mockUser,
            refreshToken: await bcrypt.hash(refreshToken, salt),
          }),
        }),
      );

      const _id: unknown = mockUser._id;
      const filter = buildFilter('_id', _id as MongooseSchema.Types.ObjectId);
      const user = await usersService.findOne(filter);

      expect(user._id).toBe(mockUser._id);
      expect(user.password).toBe(mockUser.password);
      expect(user.name).toBe(mockUser.name);
    });

    it('should throw NotFoundException for an invalid id.', async () => {
      const email = 'dsfafs@naver.com';

      // mockReturnValueOnce() 메서드는 특정 함수 호출의 반환 값을 모의한다.
      jest.spyOn(usersModel, 'findOne').mockReturnValueOnce(
        createMock<Query<User, User>>({
          lean: jest.fn().mockRejectedValueOnce(new NotFoundException()),
        }) as any,
      );

      const filter = buildFilter('email', email);

      await expect(usersService.findOne(filter)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('exists', () => {
    it('should return a user.', async () => {
      jest.spyOn(usersModel, 'exists').mockReturnValueOnce(
        createMock<Query<User, User>>({
          lean: jest.fn().mockResolvedValueOnce({
            _id: mockUser._id,
          }),
        }) as any,
      );

      const filter = buildFilter('email', mockUser.email);
      const user = await usersService.exists(filter);

      expect(user._id).toBe(mockUser._id);
    });

    it('should return a null.', async () => {
      jest.spyOn(usersModel, 'exists').mockReturnValueOnce(
        createMock<Query<User, User>>({
          lean: jest.fn().mockResolvedValueOnce(null),
        }) as any,
      );

      const email = 'sfasf@gmail.com';
      const filter = buildFilter('email', email);
      const user = await usersService.exists(filter);

      expect(user).toBe(null);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
