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

  @Prop({ type: ItemSchema })
  @Type(() => Item)
  item: Item;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
