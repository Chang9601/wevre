import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Type } from 'class-transformer';

import { Item, ItemSchema } from './item.entity';

@Schema()
export class Room extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ default: Date.now })
  createdAt: Date;

  // 일대일(1:1) 관계.
  // 다대일, 일대다, 다대다와 달리 ref 속성을 사용하지 않는다.
  // 즉, 관계를 사용하지 않고 Item 문서를 Room 문서에 중첩한다.
  @Prop({ type: ItemSchema })
  @Type(() => Item)
  item: Item;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
