import { IsMongoId } from 'class-validator';
import { Schema as MongooseSchema } from 'mongoose';

export class LeaveRoomDto {
  @IsMongoId()
  roomId: MongooseSchema.Types.ObjectId;
}
