import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Room } from './room.entity';
import { Type } from 'class-transformer';
import { User } from './user.entity';

@Schema()
export class Message extends Document {
  @Prop({ required: true })
  content: string;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: User.name })
  @Type(() => User)
  user: User;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: Room.name })
  @Type(() => Room)
  room: Room;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
