import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from './../src/app.module';

describe('Room E2E Test', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('getRoom', () => {
    it('should get a room.', async () => {
      const id = '64e8931bb743b0ae0d83c934';

      const response = await request(app.getHttpServer())
        .get(`/rooms/${id}`)
        .expect(HttpStatus.OK);

      const body = response.body;

      expect(body._id).toBeDefined();
      expect(body.name).toBeDefined();
      expect(body.description).toBeDefined();
    });

    it('should throw NotFoundException for an invalid id.', async () => {
      const id = '64sfamlkxvzslkdfmlsk';

      await request(app.getHttpServer())
        .get(`/rooms/${id}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  afterEach(async () => await app.close());
});
