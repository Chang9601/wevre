import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import { Schema as MongooseSchema } from 'mongoose';

import { ValidationError } from '../common/enums/common.enum';

export class LeaveRoomDto {
  @ApiProperty({
    example: '64e8931bb743b0ae0d83c772',
  })
  @IsMongoId({
    message: ValidationError.OBJECT_ID_TYPE,
  })
  roomId: MongooseSchema.Types.ObjectId;
}
