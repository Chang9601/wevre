import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema as MongooseSchema } from 'mongoose';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { Item } from '../../entities/item.entity';
import { QueryBuilder } from '../../utils/query-builder';
import { Category } from '../../entities/category.entity';

export class ItemsRepository {
  constructor(
    @InjectModel(Item.name) private readonly itemsModel: Model<Item>,
    @InjectModel(Category.name)
    private readonly categoriesModel: Model<Category>,
  ) {}

  async find(limit: number, skip: number, search: string, sort: string) {
    try {
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
          .skip(skip)
          .limit(limit)
          .sort(sortQuery)) as Item[];

        const count = items.length;
        const page = Math.ceil(skip / limit) + 1;
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
          .skip(skip)
          .limit(limit)
          .sort(sortQuery);
      });

      const searchResults = await Promise.all(searchPromises);
      const items = (searchResults.find((result) => result.length > 0) ||
        []) as Item[];
      const count = items.length;
      const page = Math.ceil(skip / limit) + 1;
      const pages = Math.ceil(count / limit);

      return { items, page, pages, count };
    } catch (error) {
      throw new InternalServerErrorException('Error finding a list of items.');
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
        throw new NotFoundException('Item with this id not found.');
      }

      return item;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Error finding an item by id.');
      }
    }
  }
}
