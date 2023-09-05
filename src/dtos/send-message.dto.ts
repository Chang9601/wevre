import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { Schema as MongooseSchema } from 'mongoose';

export class SendMessageDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsMongoId()
  roomId?: MongooseSchema.Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  userId?: MongooseSchema.Types.ObjectId;
}
