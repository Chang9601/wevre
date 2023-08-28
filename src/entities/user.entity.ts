import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { Document, Schema as MongooseSchema } from 'mongoose';

import { Room } from './room.entity';
import { Role } from '../common/enums/common.enum';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  membershipNumber: string;

  @Prop({ required: true, default: false })
  bidAgreement: boolean;

  @Prop({ required: false })
  refreshToken: string;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: [Role.USER] })
  roles: Role[];

  @Prop({
    required: false,
    type: MongooseSchema.Types.ObjectId,
    ref: 'Room',
  })
  @Type(() => Room)
  room: Room;
}

export const UserSchema = SchemaFactory.createForClass(User);
