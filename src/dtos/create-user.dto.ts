import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, Matches } from 'class-validator';

import { ValidationError, Role } from '../common/enums/common.enum';
import { ValidationRegex } from '../common/regex/common.regex';

export class CreateUserDto {
  @ApiProperty({
    minLength: 3,
    description: '이름은 반드시 한글만 포함.',
    example: '박선심',
  })
  @Matches(ValidationRegex.NAME, {
    message: ValidationError.NAME,
  })
  name: string;

  @ApiProperty({
    example: 'sunshim@naver.com',
  })
  @Matches(ValidationRegex.EMAIL, {
    message: ValidationError.EMAIL,
  })
  email: string;

  @ApiProperty({
    minLength: 8,
    maxLength: 15,
    description:
      '비밀번호는 최소한 하나의 소문자(a-z), 하나의 대문자(A-Z), 하나의 숫자(0-9), 하나의 특수 문자(!@#$%^&*)를 반드시 포함.',
    example: '1234Aa!@',
  })
  @Matches(ValidationRegex.PASSWORD, {
    message: ValidationError.PASSWORD,
  })
  password: string;

  @IsEnum(Role)
  role: Role = Role.USER;
}
