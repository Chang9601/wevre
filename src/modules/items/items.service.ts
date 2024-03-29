import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { PaginationDto } from '../../dtos/pagination.dto';
import { PageStateDto } from '../../dtos/page-state.dto';
import { PageDto } from '../../dtos/page.dto';
import { Item } from '../../entities/item.entity';
import { QueryBuilder } from '../../common/factories/query-builder.factory';

// items.service.spec.ts
// Cannot determine a type for the "Room.item" field (union/intersection/ambiguous type was used).
// Room 엔티티와 일대일 관계를 가지는 Item 엔티티의 타입이 복합 타입인 ItemSchema라서 오류가 발생한다. 아직 해결하지 못했다.
@Injectable()
export class ItemsService {
  constructor(
    @InjectModel(Item.name) private readonly itemsModel: Model<Item>,
  ) {}

  // TypeORM의 findAndCount()와 같은 메서드가 없다.
  // 상품 이름과 작가 이름만 검색 가능하다(카테고리 추가 필요.).
  async find(paginationDto: PaginationDto): Promise<PageDto<Item>> {
    const { limit, search, sort, skip } = paginationDto;
    const options = ['itemName', 'artistName'];

    const EXCLUDED_FIELDS = '-createdAt -updatedAt';

    const queryBuilder = new QueryBuilder(search, sort);
    const sortQuery = queryBuilder.buildSortQuery();

    const itemPromises = options.map((option) => {
      const searchQuery = queryBuilder.buildSearchQuery(option);

      return this.itemsModel
        .find(searchQuery)
        .select(EXCLUDED_FIELDS)
        .populate('category')
        .populate('materials')
        .skip(skip)
        .limit(limit)
        .sort(sortQuery)
        .lean();
    });

    const totalPromises = options.map((option) => {
      const searchQuery = queryBuilder.buildSearchQuery(option);

      return this.itemsModel.countDocuments(searchQuery);
    });

    const itemsResults = await Promise.all(itemPromises);
    const totalResults = await Promise.all(totalPromises);

    const items: Item[] = itemsResults.find((items) => items.length > 0) || [];
    const total = totalResults.find((total) => total) || 0;

    const pageStateDto = new PageStateDto(total, paginationDto);

    if (pageStateDto.lastPage < pageStateDto.currentPage) {
      throw new NotFoundException('존재하지 않는 페이지.');
    }

    return new PageDto(pageStateDto, items);
  }

  async findOne(filter: FilterQuery<Item>, fullItem = false): Promise<Item> {
    const EXCLUDED_FIELDS =
      '-auctionStatus -seller -adminNumber -createdAt -updatedAt';

    let query = this.itemsModel.findOne(filter);

    if (!fullItem) {
      query = query.populate('materials category').select(EXCLUDED_FIELDS);
    }

    // lean() 메서드는 쿼리 결과를 Mongoose 도큐먼트가 아닌 일반 JavaScript 객체로 반환한다.
    // lean() 메서드를 사용하면 Mongoose가 결과를 완전한 Mongoose 도큐먼트로 변환하는 과정을 건너뛰어 더 가벼우면서 빠른 연산이 가능하다.
    // 기본적으로 Mongoose를 사용하여 쿼리를 실행하면 결과는 Mongoose 도큐먼트로 반환된다. 도큐먼트에는 Mongoose 모델의 기능 일부인 추가 메서드 및 속성이 포함되어 있다.
    // lean() 메서드를 사용하면 결과는 일반 JavaScript 객체라서 Mongoose 도큐먼트 메서드를 사용할 수 없으므로 주의해야 한다.
    const item = await query.lean();

    if (!item) {
      throw new NotFoundException('아이디에 해당하는 상품 없음.');
    }

    return item;
  }

  async findAll(): Promise<Item[]> {
    // save() 메서드를 사용해야 하기 때문에 lean() 메서드를 생략한다.
    return await this.itemsModel.find();
  }
}
