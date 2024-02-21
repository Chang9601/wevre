import { ApiProperty } from '@nestjs/swagger';

import { PaginationDto } from './pagination.dto';

export class PageStateDto {
  @ApiProperty({
    description: '항목의 총 개수',
    example: 30,
  })
  total: number;

  @ApiProperty({
    description: '한 번에 가져오는 항목의 최대 개수',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: '항목을 가져오는 기준점',
    example: 1,
  })
  offset: number;

  @ApiProperty({
    example: 1,
  })
  currentPage: number;

  @ApiProperty({
    example: 3,
  })
  lastPage: number;

  @ApiProperty({
    example: false,
  })
  isPreviousPageValid: boolean;

  @ApiProperty({
    example: true,
  })
  isNextPageValid: boolean;

  constructor(total: number, paginationDto: PaginationDto) {
    this.total = total;
    this.limit = paginationDto.limit;
    this.offset = paginationDto.offset;
    this.currentPage = this.offset <= 0 ? 1 : this.offset;
    this.lastPage = Math.ceil(this.total / this.limit);
    this.isPreviousPageValid = this.currentPage > 1;
    this.isNextPageValid = this.currentPage < this.lastPage;
  }
}
