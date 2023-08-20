import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { Schema as MongooseSchema, Types } from 'mongoose';
import { BadRequestException } from '@nestjs/common';
import { Item } from '../../entities/item.entity';

const items: Partial<Item>[] = [
  {
    id: '64e8931bb743b0ae0d83c930',
    itemName: '풍경 산책',
    artistName: '명진우',
    completionDate: '2019',
    width: 8.1,
    length: 4.9,
    height: 3.2,
    weight: 0.04,
    adminNumber: 'TSZP623518',
    description: '자연 풍경을 즐기며 걷는 시간의 소중함을 담았습니다.',
    initialBid: 4020000,
  },
  {
    id: '64e8931bb743b0ae0d83c92f',
    itemName: '다누리가 찍은 달',
    artistName: '진코딩',
    completionDate: '2023',
    width: 100,
    length: 100,
    height: 3,
    weight: 3,
    adminNumber: 'XSEF650251',
    description:
      '한국산 달 인공위성인 다누리가 달 주변을 돌며 찍어 보낸 사진입니다.',
    initialBid: 1351300,
  },
  {
    _id: '64e8931bb743b0ae0d83c92d',
    itemName: '미개발 투기 지역',
    artistName: '명진우',
    completionDate: '2021',
    width: 60,
    length: 180,
    height: 2,
    weight: 4,
    adminNumber: 'AVED951351',
    description: '독일 코헬 지역의 아름다운 풍경을 담은 사진입니다.',
    initialBid: 1935000,
  },
];

const paginationDto = {
  limit: 10,
  skip: 0,
  search: '',
  sort: 'date',
};

describe('ItemsController', () => {
  let itemsController: ItemsController;
  let itemsService: Partial<ItemsService>;

  beforeEach(async () => {
    itemsService = {
      findOne: async (id: MongooseSchema.Types.ObjectId) => {
        if (!Types.ObjectId.isValid(id.toString())) {
          throw new BadRequestException('Invalid ObjectId.');
        }

        const item = items.find((item) => item.id === id) as Item;

        return item;
      },
      find: async (
        _limit: number,
        _skip: number,
        search: string,
        _sort: string,
      ) => {
        const searchResult = items.filter((item) => {
          return item.artistName === search;
        }) as Item[];

        return searchResult;
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [{ provide: ItemsService, useValue: itemsService }],
    }).compile();

    itemsController = module.get<ItemsController>(ItemsController);
  });

  it('should be defined', () => {
    expect(itemsController).toBeDefined();
  });

  it('should find an item by id', async () => {
    const item = await itemsController.getItem(items[0].id);

    expect(item.itemName).toEqual('풍경 산책');
    expect(item.artistName).toEqual('명진우');
  });

  it('should throw BadRequestExcetpion with an invalid ObjectId', async () => {
    const id: unknown = '11eds8931bb743b0ae0d83c930';

    await expect(
      itemsController.getItem(id as MongooseSchema.Types.ObjectId),
    ).rejects.toThrowError(BadRequestException);
  });

  it('should find nothing', async () => {
    paginationDto.search = '박선심';
    const searchResult = await itemsController.getAllItems(paginationDto);

    expect(searchResult).toHaveLength(0);
  });

  it('should find a list of items meeting conditions', async () => {
    paginationDto.search = '명진우';
    const searchResult = await itemsController.getAllItems(paginationDto);

    expect(searchResult).toHaveLength(2);
    expect(searchResult[0].artistName).toEqual('명진우');
    expect(searchResult[1].artistName).toEqual('명진우');
  });
});
