import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { Schema as MongooseSchema } from 'mongoose';

import { ValidationError } from '../common/enums/common.enum';
import { ApiProperty } from '@nestjs/swagger';

export class MakeBidDto {
  @ApiProperty({
    example: 6200000,
  })
  @IsString({
    message: ValidationError.STRING_TYPE,
  })
  price: number;

  @ApiProperty({
    description: '소켓 통신 세션 아이디',
    example: 6200000,
  })
  @IsString({
    message: ValidationError.STRING_TYPE,
  })
  @IsOptional()
  sessionId: string;

  @ApiProperty({
    example: '64e96c5f3e05f200d185cb0c',
  })
  @IsMongoId({
    message: ValidationError.OBJECT_ID_TYPE,
  })
  @IsOptional()
  userId: MongooseSchema.Types.ObjectId;

  @ApiProperty({
    example: '64e8931bb743b0ae0d83c920',
  })
  @IsMongoId({
    message: ValidationError.OBJECT_ID_TYPE,
  })
  @IsOptional()
  itemId: MongooseSchema.Types.ObjectId;

  @ApiProperty({
    example: '65a7bd8066f3af87b516a6cb',
  })
  @IsMongoId({
    message: ValidationError.OBJECT_ID_TYPE,
  })
  @IsOptional()
  roomId: MongooseSchema.Types.ObjectId;
}
