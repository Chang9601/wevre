import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Item, ItemSchema } from '../../entities/item.entity';
import { ItemsRepository } from './items.repository';
import { Category, CategorySchema } from '../../entities/category.entity';
import { Material, MaterialSchema } from '../../entities/material.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Item.name, schema: ItemSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Material.name, schema: MaterialSchema },
    ]),
  ],
  controllers: [ItemsController],
  providers: [ItemsService, ItemsRepository],
})
export class ItemsModule {}
