import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { Schema as MongooseSchema } from 'mongoose';

import { Category } from '../entities/category.entity';
import { Material } from '../entities/material.entity';

export class ItemDto {
  @ApiProperty({
    example: '65a7caf10f07b24e435b49db',
  })
  @Expose()
  id: MongooseSchema.Types.ObjectId;

  @ApiProperty({
    example: '숲',
  })
  @Expose()
  itemName: string;

  @ApiProperty({
    example: '김경래',
  })
  @Expose()
  artistName: string;

  @ApiProperty({
    example: 1352000,
  })
  @Expose()
  initialBid: number;

  @ApiProperty({
    example: '2022',
  })
  @Expose()
  completionDate: Date;

  @ApiProperty({
    example: 0.52,
  })
  @Expose()
  weight: number;

  @ApiProperty({
    example: 4.8,
  })
  @Expose()
  height: number;

  @ApiProperty({
    example: 11,
  })
  @Expose()
  width: number;

  @ApiProperty({
    example: 27,
  })
  @Expose()
  length: number;

  @Transform(({ obj }) =>
    obj.materials.map((material: Material) => material.name),
  )
  @Type(() => Material)
  @Expose()
  materials: Material[];

  @Transform(({ obj }) => obj.category.name)
  @Type(() => Category)
  @Expose()
  category: Category;
}
