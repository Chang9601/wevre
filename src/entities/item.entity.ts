import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Type } from 'class-transformer';

import { User } from './user.entity';
import { Category } from './category.entity';
import { Material } from './material.entity';

@Schema()
export class Item extends Document {
  @Prop({ required: true })
  itemName: string;

  @Prop({ required: true })
  artistName: string;

  @Prop({ required: true })
  completionDate: string;

  @Prop({ required: true })
  width: number;

  @Prop({ required: true })
  length: number;

  @Prop({ required: true })
  height: number;

  @Prop({ required: true })
  weight: number;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, unique: true })
  adminNumber: string;

  @Prop({ required: true })
  initialBid: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true, default: false })
  auctionStatus: boolean;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  @Type(() => User)
  seller: User;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'Category',
  })
  @Type(() => Category)
  category: Category;

  // 다대다(M:N, 상품:재료) 관계.
  // type 속성과 ref 속성이 배열([]) 속에 있다.
  @Prop({
    required: true,
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Material' }],
  })
  @Type(() => Material)
  materials: Material[];
}

export const ItemSchema = SchemaFactory.createForClass(Item);
