import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Expose, Type } from 'class-transformer';

import { ValidationError, Pagination } from '../common/enums/common.enum';

export class PaginationDto {
  @ApiProperty({
    description: '기준점',
    example: 1,
  })
  @Min(0)
  @IsInt({ message: ValidationError.INTEGER_TYPE })
  @IsNumber()
  @Type(() => Number)
  offset: number = Pagination.OFFSET;

  @ApiProperty({
    description: '최대 개수',
    example: 10,
  })
  @Min(1)
  @IsInt({ message: ValidationError.INTEGER_TYPE })
  @IsNumber()
  @Type(() => Number)
  limit: number = Pagination.LIMIT;

  @ApiProperty({
    description: '검색어',
    example: '공예',
  })
  @IsString({ message: ValidationError.STRING_TYPE })
  @IsOptional()
  search?: string = Pagination.SEARCH;

  @ApiProperty({
    description: '정렬 기준',
    example: 'date',
  })
  @IsString({ message: ValidationError.STRING_TYPE })
  @IsOptional()
  sort?: string = Pagination.SORT;

  @Expose()
  get skip() {
    return this.offset <= 0 ? 0 : (this.offset - 1) * this.limit;
  }
}
