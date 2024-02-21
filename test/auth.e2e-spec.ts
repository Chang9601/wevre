import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as mongoose from 'mongoose';

import { AppModule } from '../src/app.module';
import { CreateUserDto } from '../src/dtos/create-user.dto';
import { Role } from '../src/common/enums/common.enum';
import { buildDatabaseUri } from '../src/common/factories/common.factory';

describe('Authentication E2E Test', () => {
  let app: INestApplication;
  let createUserDto: CreateUserDto;
  let credentials: {
    email: string;
    password: string;
  };

  beforeEach(async () => {
    createUserDto = {
      name: '박선심',
      password: '1234Aa!@',
      email: 'sunshim@naver.com',
      role: Role.USER,
    };

    credentials = {
      email: 'sunshim@naver.com',
      password: '1234Aa!@',
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('signUp', () => {
    it('should throw BadRequestException for an invalid name.', async () => {
      createUserDto.name = '박선';

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should throw BadRequestException for an invalid password.', async () => {
      createUserDto.password = '1234';

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should throw BadRequestException for an invalid email.', async () => {
      createUserDto.email = 'sunshim';

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should create a user.', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      const body = response.body;

      expect(body.password).not.toBe(createUserDto.password);
      expect(body.email).toBe(createUserDto.email);
    });

    it('should throw ConflictException for a duplicate email.', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.CONFLICT);
    });
  });

  describe('signIn', () => {
    it('should throw BadRequestException for an invalid email.', async () => {
      credentials.email = 'sfaslkf@naver.com';

      await request(app.getHttpServer())
        .post('/auth/signin')
        .send(credentials)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should throw BadRequestException for an invalid password.', async () => {
      credentials.password = '24391!@svz';

      await request(app.getHttpServer())
        .post('/auth/signin')
        .send(credentials)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should sign in a user.', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send(credentials)
        .expect(HttpStatus.OK);

      const headers = response.headers;

      const cookies = headers['set-cookie'].map(
        (cookie: string) => cookie.split(';')[0],
      );
      expect(cookies).toBeDefined();

      const accessToken = cookies
        .find((cookie: string) => cookie.includes('access_token'))
        .split('=')[1];
      const refreshToken = cookies
        .find((cookie: string) => cookie.includes('refresh_token'))
        .split('=')[1];

      const body = response.body;

      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
      expect(body.email).toBe(credentials.email);
    });
  });

  describe('signOut', () => {
    it('should sign out a user.', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      let response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send(credentials)
        .expect(HttpStatus.OK);

      const headers = response.headers;

      let cookies = headers['set-cookie'];
      expect(cookies).toBeDefined();

      response = await request(app.getHttpServer())
        .post('/auth/signout')
        .set('Cookie', cookies)
        .expect(HttpStatus.NO_CONTENT);

      cookies = response.headers['set-cookie'].map(
        (cookie: string) => cookie.split(';')[0],
      );
      expect(cookies).toBeDefined();

      const accessToken = cookies
        .find((cookie: string) => cookie.includes('access_token'))
        .split('=')[1];
      const refreshToken = cookies
        .find((cookie: string) => cookie.includes('refresh_token'))
        .split('=')[1];

      expect(accessToken).toBe('');
      expect(refreshToken).toBe('');
    });
  });

  afterEach(async () => {
    mongoose.connect(buildDatabaseUri());

    await mongoose.connection.dropCollection('users');
    await mongoose.connection.createCollection('users');

    await mongoose.disconnect();
    await app.close();
  });
});
