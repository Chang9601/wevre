import { Test, TestingModule } from '@nestjs/testing';
import { ItemsService } from './items.service';
import { ItemsRepository } from './items.repository';
import { Item } from '../../entities/item.entity';
import { NotFoundException } from '@nestjs/common';
import { Schema as MongooseSchema } from 'mongoose';

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

describe('ItemsService', () => {
  let itemsService: ItemsService;
  let itemsRepository: Partial<ItemsRepository>;

  beforeEach(async () => {
    itemsRepository = {
      findOne: async (id: MongooseSchema.Types.ObjectId) => {
        const item = items.find((item) => item.id === id) as Item;

        if (!item) {
          throw new NotFoundException('Item with this id not found.');
        }

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
      providers: [
        ItemsService,
        {
          provide: ItemsRepository,
          useValue: itemsRepository,
        },
      ],
    }).compile();

    itemsService = module.get<ItemsService>(ItemsService);
  });

  it('should be defined', () => {
    expect(itemsService).toBeDefined();
  });

  it('should find an item by id', async () => {
    const item = await itemsService.findOne(items[1].id);

    expect(item.itemName).toEqual('다누리가 찍은 달');
    expect(item.artistName).toEqual('진코딩');
  });

  it('should throw NotFoundException', async () => {
    const id: unknown = '64e8931bb743b0ae0d83c92e';

    await expect(
      itemsService.findOne(id as MongooseSchema.Types.ObjectId),
    ).rejects.toThrowError(NotFoundException);
  });

  it('should find nothing', async () => {
    const limit = 10;
    const skip = 0;
    const search = '박선심';
    const sort = 'date';

    const searchResult = await itemsService.find(limit, skip, search, sort);

    expect(searchResult).toHaveLength(0);
  });

  it('should find a list of items meeting conditions', async () => {
    const limit = 10;
    const skip = 0;
    const search = '명진우';
    const sort = 'date';

    const searchResult = await itemsService.find(limit, skip, search, sort);

    expect(searchResult).toHaveLength(2);
    expect(searchResult[0].artistName).toEqual('명진우');
    expect(searchResult[1].artistName).toEqual('명진우');
  });
});
