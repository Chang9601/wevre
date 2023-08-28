import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Schema as MongooseSchema } from 'mongoose';

export class UserDto {
  id: MongooseSchema.Types.ObjectId;

  @ApiProperty({
    example: '박선심',
  })
  @Expose()
  name: string;

  @ApiProperty({
    example: 'sunshim@naver.com',
  })
  @Expose()
  email: string;

  @ApiProperty({
    example: true,
  })
  @Expose()
  bidAgreement: boolean;

  constructor(name: string, email: string, id?: MongooseSchema.Types.ObjectId) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
}
