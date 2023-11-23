import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

import { PAGINATION } from '../utils/pagination.enum';

export class PaginationDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset: number = PAGINATION.SKIP;

  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  @Min(1)
  limit: number = PAGINATION.LIMIT;

  @IsOptional()
  @IsString()
  search?: string = PAGINATION.SEARCH;

  @IsOptional()
  @IsString()
  sort?: string = PAGINATION.SORT;
}
