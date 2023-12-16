import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { Schema as MongooseSchema } from 'mongoose';

export class SendMessageDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsMongoId()
  userId?: MongooseSchema.Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  itemId?: MongooseSchema.Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  roomId?: MongooseSchema.Types.ObjectId;
}
