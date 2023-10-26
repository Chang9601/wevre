import { IsMongoId } from 'class-validator';
import { Schema as MongooseSchema } from 'mongoose';

export class JoinRoomDto {
  @IsMongoId()
  roomId: MongooseSchema.Types.ObjectId;
}
