import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Schema as MongooseSchema } from 'mongoose';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { BidsDto } from '../../dtos/bids.dto';
import { PaginationDto } from '../../dtos/pagination.dto';
import { PageDto } from '../../dtos/page.dto';
import { Bid } from '../../entities/bid.entity';
import { BidsService } from './bids.service';
import { ParseObjectIdPipe } from '../../pipes/parse-object-id.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { IBid } from '../../interfaces/types.interface';
import { Serialize } from '../../interceptors/serialize.interceptor';

@ApiTags('bids')
@Controller('bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @ApiNotFoundResponse({
    description: '존재하지 않는 경매방.',
  })
  @ApiOkResponse({
    description: '최고 입찰가 검색 성공.',
  })
  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  async getHighestBid(
    @Param('id', ParseObjectIdPipe) _id: MongooseSchema.Types.ObjectId,
  ): Promise<IBid> {
    return await this.bidsService.findHighestOne(_id);
  }

  @ApiNotFoundResponse({
    description: '빈 입찰 목록.',
  })
  @ApiOkResponse({
    type: BidsDto,
    description: '입찰 목록 검색 성공.',
  })
  @HttpCode(HttpStatus.OK)
  @Serialize(BidsDto)
  @UseGuards(JwtAuthGuard)
  @Get('')
  async getBids(
    @Req() request: RequestWithUser,
    @Query() paginationDto: PaginationDto,
  ): Promise<PageDto<Bid>> {
    const { user } = request;

    return await this.bidsService.find(paginationDto, user);
  }
}
