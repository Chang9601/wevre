import { InjectModel } from '@nestjs/mongoose';
import { Item } from '../../entities/item.entity';
import { Model, Schema as MongooseSchema } from 'mongoose';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { QueryBuilder } from '../../utils/query-builder';
import { Category } from '../../entities/category.entity';

export class ItemsRepository {
  constructor(
    @InjectModel(Item.name) private readonly itemsModel: Model<Item>,
    @InjectModel(Category.name)
    private readonly categoriesModel: Model<Category>,
  ) {}

  async find(
    limit: number,
    skip: number,
    search: string,
    sort: string,
  ): Promise<Item[]> {
    try {
      const queryBuilder = new QueryBuilder(search, sort);

      const sortBuilder = queryBuilder.buildSortQuery();

      const options = ['itemName', 'artistName'];

      const category = await this.categoriesModel.findOne({ name: search });

      if (category) {
        return await this.itemsModel
          .find({
            category,
          })
          .select('-createdAt -updatedAt')
          .populate('category')
          .populate('materials')
          .skip(skip)
          .limit(limit)
          .sort(sortBuilder);
      }

      const searchPromises = options.map((option) => {
        const searchBuilder = queryBuilder.buildSearchQuery(option);
        return this.itemsModel
          .find(searchBuilder)
          .select('-createdAt -updatedAt')
          .populate('category')
          .populate('materials')
          .skip(skip)
          .limit(limit)
          .sort(sortBuilder);
      });

      const searchResults = await Promise.all(searchPromises);
      const items = searchResults.find((result) => result.length > 0) || [];

      return items;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while finding a list of items.',
      );
    }
  }

  async findOne(id: MongooseSchema.Types.ObjectId): Promise<Item> {
    try {
      const item = await this.itemsModel
        .findOne({ _id: id })
        .populate('materials')
        .select(
          '-auctionStatus -category -seller -adminNumber -startDate -endDate -createdAt -updatedAt',
        );

      if (!item) {
        throw new NotFoundException('Item with this id not found.');
      }

      return item;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while finding an itme by id.',
      );
    }
  }
}
