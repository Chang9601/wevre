import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import mongoose, {
  ClientSession,
  Model,
  Schema as MongooseSchema,
} from 'mongoose';
import { ObjectId } from 'mongodb';

import { Room } from '../../entities/room.entity';
import { RoomsService } from './rooms.service';
import { ItemsService } from '../items/items.service';
import { BidsService } from '../bids/bids.service';
import { buildFilter } from '../../common/factories/common.factory';

// 원본 메서드가 배열을 순회하기 때문에 임시방편으로 추가한다.
const mockItem = {
  _id: new ObjectId(),
  itemName: '경청',
  initialBid: 6250000,
  auctionStatus: true,
  startDate: new Date('2023-09-01'),
  endDate: new Date('2023-10-01'),
  save: () => 0,
};

// 원본 메서드가 배열을 순회하기 때문에 임시방편으로 추가한다.
const mockRoom = {
  _id: new ObjectId(),
  name: '경청 경매방',
  startDate: mockItem.startDate,
  endDate: mockItem.endDate,
  item: mockItem,
  deleteOne: () => 0,
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

describe('RoomsService', () => {
  let roomsService: RoomsService;
  let roomsModel: Model<Room>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        {
          provide: getModelToken('Room'),
          useValue: {
            create: jest.fn().mockResolvedValue([mockRoom]),
            findOne: jest.fn(),
          },
        },
        {
          provide: ItemsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([mockItem]),
          },
        },
        {
          provide: BidsService,
          useValue: {
            findHighestOne: jest.fn().mockResolvedValue(mockBid2),
            deleteAllButHighest: jest
              .fn()
              .mockResolvedValue([mockBid1, mockBid2].splice(0, 1).length),
          },
        },
      ],
    }).compile();

    roomsService = module.get<RoomsService>(RoomsService);
    roomsModel = module.get<Model<Room>>(getModelToken('Room'));
  });

  it('should be defined', () => {
    expect(roomsService).toBeDefined();
  });

  describe('create', () => {
    it('should create rooms for items.', async () => {
      jest.spyOn(mongoose, 'startSession').mockResolvedValueOnce({
        withTransaction: jest.fn(async (fn) => await fn()),
        endSession: jest.fn(),
      } as unknown as ClientSession);

      const result = await roomsService.create();

      expect(result.message).toBe('경매방 생성 완료.');
    });
  });

  describe('findOne', () => {
    it('should find a room.', async () => {
      jest.spyOn(roomsModel, 'findOne').mockResolvedValueOnce(mockRoom);

      const _id: unknown = mockRoom._id;
      const filter = buildFilter('_id', _id as MongooseSchema.Types.ObjectId);
      const room = await roomsService.findOne(filter);

      expect(room._id).toBe(mockRoom._id);
      expect(room.name).toBe(mockRoom.name);
    });

    it('should throw NotFoundException for an invalid id.', async () => {
      jest
        .spyOn(roomsModel, 'findOne')
        .mockRejectedValueOnce(new NotFoundException());

      const _id: unknown = 'fmdskl19102sdavzx';
      const filter = buildFilter('_id', _id as MongooseSchema.Types.ObjectId);

      await expect(roomsService.findOne(filter)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete rooms for items.', async () => {
      jest.spyOn(mongoose, 'startSession').mockResolvedValueOnce({
        withTransaction: jest.fn(async (fn) => await fn()),
        endSession: jest.fn(),
      } as unknown as ClientSession);

      jest.spyOn(roomsModel, 'findOne').mockResolvedValueOnce(mockRoom);

      const result = await roomsService.delete();

      expect(result.message).toBe('경매방 삭제 완료.');
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
