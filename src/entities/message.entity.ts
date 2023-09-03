import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Type } from 'class-transformer';

import { Room } from './room.entity';
import { User } from './user.entity';

@Schema()
export class Message extends Document {
  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  @Type(() => User)
  user: User;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Room' })
  @Type(() => Room)
  room: Room;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
