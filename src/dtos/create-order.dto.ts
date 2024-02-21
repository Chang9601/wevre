import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

import { ValidationError } from '../common/enums/common.enum';
import { ValidationRegex } from '../common/regex/common.regex';

export class CreateOrderDto {
  @ApiProperty({
    minLength: 3,
    description: '도로명 주소.',
    example: '부산광역시 기장군 일광읍 기장대로 692',
  })
  @Matches(ValidationRegex.STREET_ADDRESS, {
    message: ValidationError.STREET_ADDRESS,
  })
  streetAddress: string;

  @ApiProperty({
    description: '상세 주소.',
    example: '4층 정장계',
  })
  @Matches(ValidationRegex.ADDRESS, {
    message: ValidationError.ADDRESS,
  })
  address: string;

  @ApiProperty({
    description: '우편번호는 정확히 다섯 자리의 숫를 반드시 포함.',
    example: '46044',
  })
  @Matches(ValidationRegex.ZIPCODE, {
    message: ValidationError.ZIPCODE,
  })
  zipcode: string;
}
