import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Type } from 'class-transformer';

import { Room } from './room.entity';
import { User } from './user.entity';
import { Item } from './item.entity';

@Schema()
export class Bid extends Document {
  @Prop({ required: true })
  price: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  // 다대일(N:1, 입찰:사용자) 관계.
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  @Type(() => User)
  user: User;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Room' })
  @Type(() => Room)
  room: Room;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Item' })
  @Type(() => Item)
  item: Item;
}

export const BidSchema = SchemaFactory.createForClass(Bid);
