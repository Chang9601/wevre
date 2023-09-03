import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class SendMessageDto {
  @IsString()
  text: string;

  @IsOptional()
  @IsMongoId()
  roomId?: string;

  @IsOptional()
  @IsMongoId()
  userId?: string;
}
