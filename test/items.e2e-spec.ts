import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from './../src/app.module';
import { PaginationDto } from '../src/dtos/pagination.dto';

describe('Item E2E Test', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('getItem', () => {
    it('should get an item.', async () => {
      const id = '64e8931bb743b0ae0d83c923';

      const response = await request(app.getHttpServer())
        .get(`/items/${id}`)
        .expect(HttpStatus.OK);

      const body = response.body;

      expect(body._id).toBeDefined();
      expect(body.itemName).toBeDefined();
    });

    it('should throw NotFoundException for an invalid id.', async () => {
      const id = '64sfafsxbdgdgd';

      await request(app.getHttpServer())
        .get(`/items/${id}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('getItems', () => {
    it('should get items.', async () => {
      const paginationDto: PaginationDto = {
        offset: 0,
        limit: 10,
        skip: 0,
      };

      const response = await request(app.getHttpServer())
        .get(`/items`)
        .query(paginationDto)
        .expect(HttpStatus.OK);

      const body = response.body;
      const items = body.items;
      const [item] = items;
      const pageState = body.pageState;

      expect(item.itemId).toBeDefined();
      expect(item.initialBid).toBeDefined();
      expect(pageState.total).toBeDefined();
      expect(pageState.currentPage).toBeDefined();
      expect(pageState.lastPage).toBeDefined();
    });

    it('should throw NotFoundException for a page that does not exist.', async () => {
      const paginationDto: PaginationDto = {
        offset: 15,
        limit: 10,
        skip: 0,
      };

      await request(app.getHttpServer())
        .get(`/items`)
        .query(paginationDto)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  afterEach(async () => await app.close());
});
