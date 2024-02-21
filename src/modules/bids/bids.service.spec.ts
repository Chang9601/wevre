import * as crypto from 'crypto';

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model, Query, Schema as MongooseSchema } from 'mongoose';
import { createMock } from '@golevelup/ts-jest';

import { PaginationDto } from '../../dtos/pagination.dto';
import { MakeBidDto } from '../../dtos/make-bid.dto';
import { Bid } from '../../entities/bid.entity';
import { UsersService } from '../users/users.service';
import { BidsService } from './bids.service';
import { RoomsService } from '../rooms/rooms.service';
import { ItemsService } from '../items/items.service';
import { Role } from '../../common/enums/common.enum';

const makeBidDto: unknown = {
  price: 6250000,
  userId: new ObjectId(),
  itemId: new ObjectId(),
  roomId: new ObjectId(),
};

const paginationDto: PaginationDto = {
  limit: 10,
  offset: 0,
  skip: 0,
};

const mockUser = {
  _id: new ObjectId(),
  name: '사용자',
  email: 'user@gmail.com',
  password: crypto.randomBytes(Math.ceil(10)).toString('hex'),
  roles: [Role.USER],
};

const mockRoom = {
  _id: new ObjectId(),
  name: '경청 경매방',
  description: '2023년 12월 15일 시작, 2024년 2월 20일 종료',
  startDate: new Date('2023-12-15'),
  endDate: new Date('2024-02-20'),
};

const mockItem = {
  _id: new ObjectId(),
  itemName: '경청',
  artistName: '신건록',
  initialBid: 6250000,
  auctionStatus: true,
};

const mockBid1 = {
  _id: new ObjectId(),
  price: 7000000,
  user: mockUser,
  item: mockItem,
  room: mockRoom,
};

const mockBid2 = {
  _id: new ObjectId(),
  price: 8000000,
  user: mockUser,
  item: mockItem,
  room: mockRoom,
};

describe('BidsService', () => {
  let bidsService: BidsService;
  let bidsModel: Model<Bid>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BidsService,
        {
          provide: getModelToken('Bid'),
          useValue: {
            create: jest.fn().mockImplementation(() =>
              Promise.resolve({
                mockBid1,
                save: () => mockBid1,
              }),
            ),
            countDocuments: jest
              .fn()
              .mockResolvedValue([mockBid1, mockBid2].length),
            find: jest.fn().mockReturnValue(
              createMock<Query<Bid, Bid>>({
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue([mockBid1, mockBid2]),
              }),
            ),
            findOne: jest.fn(),
            deleteMany: jest
              .fn()
              .mockResolvedValue([mockBid1, mockBid2].splice(0, 1).length),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockUser),
          },
        },
        {
          provide: RoomsService,
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockRoom),
          },
        },
        {
          provide: ItemsService,
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockItem),
          },
        },
      ],
    }).compile();

    bidsService = module.get<BidsService>(BidsService);
    bidsModel = module.get<Model<Bid>>(getModelToken('Bid'));
  });

  it('should be defined.', () => {
    expect(bidsService).toBeDefined();
  });

  describe('create', () => {
    it('should create a bid.', async () => {
      const bid = await bidsService.create(makeBidDto as MakeBidDto);

      expect(bid._id).toBeDefined();
      expect(bid.user._id).toBe(mockUser._id);
      expect(bid.item._id).toBe(mockItem._id);
      expect(bid.room._id).toBe(mockRoom._id);
    });
  });

  describe('findOne', () => {
    it('should find the highest bid.', async () => {
      jest.spyOn(bidsModel, 'findOne').mockReturnValueOnce(
        createMock<Query<Bid, Bid>>({
          // mockReturnThis() 메서드는 동일한 객체를 반환하여 메서드 체이닝을 가능하게 한다.
          sort: jest.fn().mockReturnThis(),
          collation: jest.fn().mockReturnThis(),
          lean: jest.fn().mockResolvedValueOnce(mockBid2),
        }),
      );

      const _id: unknown = mockItem._id;
      const bid = await bidsService.findHighestOne(
        _id as MongooseSchema.Types.ObjectId,
      );

      expect(bid.price).toBe(mockBid2.price);
      expect(bid.email).toBe(mockBid2.user.email);
    });

    it('should find the price of 0.', async () => {
      jest.spyOn(bidsModel, 'findOne').mockReturnValueOnce(
        createMock<Query<Bid, Bid>>({
          sort: jest.fn().mockReturnThis(),
          collation: jest.fn().mockReturnThis(),
          lean: jest.fn().mockResolvedValueOnce(null),
        }),
      );

      const _id: unknown = 'dafa1231rdsfa';
      const bid = await bidsService.findHighestOne(
        _id as MongooseSchema.Types.ObjectId,
      );

      expect(bid.price).toBe(0);
    });
  });

  describe('find', () => {
    it('should find bids.', async () => {
      const result = await bidsService.find(paginationDto, mockUser as any);
      const { state, data: bids } = result;
      const [bid] = bids;

      expect(bid.price).toBe(mockBid1.price);
      expect(state.total).toBe(2);
      expect(state.isPreviousPageValid).toBe(false);
    });

    it('should throw NotFoundException for a page that does not exist.', async () => {
      paginationDto.offset = 10;

      await expect(
        bidsService.find(paginationDto, mockUser as any),
      ).rejects.toThrowError(NotFoundException);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
