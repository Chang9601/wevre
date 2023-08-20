import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.entity';
import { Type } from 'class-transformer';
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

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: User.name })
  @Type(() => User)
  seller: User;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: Category.name,
  })
  @Type(() => Category)
  category: Category;

  @Prop({
    required: true,
    type: [{ type: MongooseSchema.Types.ObjectId, ref: Material.name }],
  })
  @Type(() => Material)
  materials: Material[];
}

export const ItemSchema = SchemaFactory.createForClass(Item);
