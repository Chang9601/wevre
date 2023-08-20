import { IsOptional, IsString } from 'class-validator';
import { PAGINATION } from '../utils/pagination.enum';

export class PaginationDto {
  @IsOptional()
  limit?: number = PAGINATION.LIMIT;

  @IsOptional()
  skip?: number = PAGINATION.SKIP;

  @IsOptional()
  @IsString()
  search?: string = PAGINATION.SEARCH;

  @IsOptional()
  @IsString()
  sort?: string = PAGINATION.SORT;
}
