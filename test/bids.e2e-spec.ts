import { randomUUID } from 'crypto';

import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as io from 'socket.io-client';
import * as mongoose from 'mongoose';

import { AppModule } from './../src/app.module';
import { CreateUserDto } from '../src/dtos/create-user.dto';
import { Role } from '../src/common/enums/common.enum';
import { buildDatabaseUri } from '../src/common/factories/common.factory';

describe('Bid E2E Test', () => {
  let app: INestApplication;
  let url: string;
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
    await app.listen(0, '0.0.0.0');
    url = await app.getUrl();
  });

  // 세션 쿠키를 생성하려면 어댑터에 접근해야 하는데 의존성 주입이 안되서 생성 안됨...
  describe('handleConnection', () => {
    it('should handle socket connection.', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send(credentials)
        .expect(HttpStatus.OK);

      const headers = response.headers;

      const prevCookies = headers['set-cookie'].map(
        (cookie: string) => cookie.split(';')[0],
      );
      expect(prevCookies).toBeDefined();

      const itemId = '64e8931bb743b0ae0d83c934';
      const roomId = '65cb2b941aeace02f2b8c1a9';

      const accessToken = prevCookies
        .find((cookie: string) => cookie.includes('access_token'))
        .split('=')[1];

      io.connect(url, {
        withCredentials: true,
        extraHeaders: {
          access_token: accessToken,
          socket_session_id: randomUUID(),
        },
        query: {
          item_id: itemId,
          room_id: roomId,
        },
      });

      const postCookies = headers['set-cookie'];
      expect(postCookies).toBeDefined();

      console.log(prevCookies);
      console.log(postCookies);

      // const socketSessionId = postCookies
      //   .find((cookie: string) => cookie.includes('socket_session_id'))
      //   .split('=')[1];

      // expect(socketSessionId).toBeDefined();
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
