import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

import { PAGINATION } from '../utils/pagination.enum';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = PAGINATION.LIMIT;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  skip?: number = PAGINATION.SKIP;

  @IsOptional()
  @IsString()
  search?: string = PAGINATION.SEARCH;

  @IsOptional()
  @IsString()
  sort?: string = PAGINATION.SORT;
}
