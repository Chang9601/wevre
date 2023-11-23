// import { Injectable } from '@nestjs/common';
// import { Schema as MongooseSchema } from 'mongoose';

// import { ItemsRepository } from './items.repository';
// import { objectIdValidator } from '../../utils/objectid-validator';
// import { PaginationDto } from '../../dtos/pagination.dto';

// @Injectable()
// export class BidsService {
//   // constructor(private readonly itemsRepository: ItemsRepository) {}

//   async count() {
//     return await this.itemsRepository.find(paginationDto);
//   }

//   async findOne(id: MongooseSchema.Types.ObjectId) {
//     objectIdValidator(id);

//     return await this.itemsRepository.findOne(id);
//   }
// }
