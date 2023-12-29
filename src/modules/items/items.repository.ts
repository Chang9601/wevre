import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema as MongooseSchema } from 'mongoose';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { Item } from '../../entities/item.entity';
import { QueryBuilder } from '../../utils/query-builder';
import { Category } from '../../entities/category.entity';
import { PaginationDto } from '../../dtos/pagination.dto';

export class ItemsRepository {
  constructor(
    @InjectModel(Item.name) private readonly itemsModel: Model<Item>,
    @InjectModel(Category.name)
    private readonly categoriesModel: Model<Category>,
  ) {}

  async find(paginationDto: PaginationDto) {
    try {
      const { offset, limit, search, sort } = paginationDto;

      const queryBuilder = new QueryBuilder(search, sort);

      const sortQuery = queryBuilder.buildSortQuery();

      const options = ['itemName', 'artistName'];

      const category = await this.categoriesModel.findOne({ name: search });

      if (category) {
        const items = (await this.itemsModel
          .find({
            category,
          })
          .select('-createdAt -updatedAt')
          .populate('category')
          .populate('materials')
          .skip(offset)
          .limit(limit)
          .sort(sortQuery)) as Item[];

        const count = items.length;
        const page = Math.ceil(offset / limit) + 1;
        const pages = Math.ceil(count / limit);

        return { items, page, pages, count };
      }

      const searchPromises = options.map((option) => {
        let searchQuery = queryBuilder.buildSearchQuery(option);

        if (!search) {
          searchQuery = {};
        }

        return this.itemsModel
          .find(searchQuery)
          .select('-createdAt -updatedAt')
          .populate('category')
          .populate('materials')
          .skip(offset)
          .limit(limit)
          .sort(sortQuery);
      });

      const searchResults = await Promise.all(searchPromises);
      const items = (searchResults.find((result) => result.length > 0) ||
        []) as Item[];
      const count = items.length;
      const page = Math.ceil(offset / limit) + 1;
      const pages = Math.ceil(count / limit);

      return { items, page, pages, count };
    } catch (error) {
      throw new InternalServerErrorException(
        '조건을 만족하는 상품 검색 중 오류 발생.',
      );
    }
  }

  async findOne(
    _id: MongooseSchema.Types.ObjectId,
    fullItem = false,
  ): Promise<Item> {
    try {
      const EXCLUDED_FIELDS =
        '-auctionStatus -category -seller -adminNumber -startDate -endDate -createdAt -updatedAt';

      let item: Item;

      if (fullItem) {
        item = await this.itemsModel.findOne({ _id });
      } else {
        item = await this.itemsModel
          .findOne({ _id })
          .populate('materials')
          .select(EXCLUDED_FIELDS);
      }

      if (!item) {
        throw new NotFoundException('아이디에 해당하는 상품 없음.');
      }

      return item;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          '아이디로 상품 검색 중 오류 발생.',
        );
      }
    }
  }
}
