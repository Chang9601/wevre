import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Type } from 'class-transformer';

import { User } from './user.entity';
import { Item } from './item.entity';

@Schema()
export class Order extends Document {
  @Prop({ required: true })
  totalPrice: number;

  @Prop({ required: true })
  totalQuantity: number;

  @Prop({ required: true })
  streetAddress: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  zipcode: string;

  @Prop({ required: true })
  orderNumber: string;

  @Prop({ required: true })
  orderDate: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  @Type(() => User)
  user: User;

  @Prop({
    required: true,
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Item' }],
  })
  @Type(() => Item)
  items: Item[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);
