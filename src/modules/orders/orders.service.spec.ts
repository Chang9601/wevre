import { randomUUID } from 'crypto';

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import mongoose, { ClientSession, Query } from 'mongoose';
import { ObjectId } from 'mongodb';
import { createMock } from '@golevelup/ts-jest';

import { CreateOrderDto } from '../../dtos/create-order.dto';
import { PaginationDto } from '../../dtos/pagination.dto';
import { Order } from '../../entities/order.entity';
import { BidsService } from '../bids/bids.service';
import { OrdersService } from './orders.service';

const paginationDto: PaginationDto = {
  limit: 10,
  offset: 0,
  skip: 0,
};

const createOrderDto: CreateOrderDto = {
  address: '도로명 주소',
  streetAddress: '상세 주소',
  zipcode: '우편번호',
};

const mockUser = {
  _id: new ObjectId(),
  name: '사용자',
  email: 'user@gmail.com',
};

const mockItem = {
  _id: new ObjectId(),
  itemName: '경청',
  initialBid: 6250000,
  auctionStatus: true,
  startDate: new Date('2023-09-01'),
  endDate: new Date('2023-10-01'),
};

const mockRoom = {
  _id: new ObjectId(),
  name: '경청 경매방',
  startDate: mockItem.startDate,
  endDate: mockItem.endDate,
  item: mockItem,
};

const mockBid1 = {
  _id: new ObjectId(),
  price: 7000000,
  item: mockItem,
  room: mockRoom,
};

const mockBid2 = {
  _id: new ObjectId(),
  price: 8000000,
  item: mockItem,
  room: mockRoom,
};

const mockOrder = {
  _id: new ObjectId(),
  totalPrice: 8000000,
  totalQuantity: 1,
  orderNumber: randomUUID(),
};

describe('OrdersService', () => {
  let ordersService: OrdersService;
  let bidsService: BidsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getModelToken('Order'),
          useValue: {
            create: jest.fn().mockImplementation(() =>
              Promise.resolve({
                mockOrder,
                save: () => mockOrder,
              }),
            ),
            find: jest.fn().mockReturnValue(
              createMock<Query<Order, Order>>({
                select: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue([mockOrder]),
              }),
            ),
            countDocuments: jest.fn().mockResolvedValue([mockOrder].length),
          },
        },
        {
          provide: BidsService,
          useValue: {
            findAll: jest.fn(),
            deleteAll: jest
              .fn()
              .mockResolvedValueOnce([mockBid1, mockBid2].length),
          },
        },
      ],
    }).compile();

    ordersService = module.get<OrdersService>(OrdersService);
    bidsService = module.get<BidsService>(BidsService);
  });

  it('should be defined', () => {
    expect(ordersService).toBeDefined();
  });

  describe('create', () => {
    it('should create an order.', async () => {
      jest.spyOn(mongoose, 'startSession').mockResolvedValueOnce({
        withTransaction: jest.fn(async (fn) => await fn()),
        endSession: jest.fn(),
      } as unknown as ClientSession);

      jest
        .spyOn(bidsService, 'findAll')
        .mockResolvedValueOnce([mockBid2] as any);

      const order = await ordersService.create(createOrderDto, mockUser as any);

      expect(order._id).toBe(mockOrder._id);
      expect(order.totalPrice).toBe(mockOrder.totalPrice);
    });

    it('should throw NotFoundException for having no bids.', async () => {
      jest.spyOn(mongoose, 'startSession').mockResolvedValueOnce({
        withTransaction: jest.fn(async (fn) => await fn()),
        endSession: jest.fn(),
      } as unknown as ClientSession);

      jest.spyOn(bidsService, 'findAll').mockResolvedValueOnce([]);

      await expect(
        ordersService.create(createOrderDto, mockUser as any),
      ).rejects.toThrowError(NotFoundException);
    });
  });

  describe('find', () => {
    it('should find orders.', async () => {
      const result = await ordersService.find(paginationDto, mockUser as any);
      const { state, data: orders } = result;
      const [order] = orders;

      expect(order._id).toBe(mockOrder._id);
      expect(order.totalPrice).toBe(mockOrder.totalPrice);
      expect(state.total).toBe(1);
    });

    it('should throw NotFoundException for a page that does not exist.', async () => {
      paginationDto.offset = 10;

      await expect(
        ordersService.find(paginationDto, mockUser as any),
      ).rejects.toThrowError(NotFoundException);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
