import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Schema as MongooseSchema } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { CreateUserDto } from '../../dtos/create-user.dto';
import { OAuthProfileDto } from '../../dtos/oauth-profile.dto';
import { User } from '../../entities/user.entity';
import { MongoDbErrorCode } from '../../databases/mongodb-error-code.enum';
import { buildFilter } from '../../common/factories/common.factory';
import { Role } from '../../common/enums/common.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly usersModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    const roles = [createUserDto.role];

    // new this.usersModel()은 테스트 코드에서 사용하기 어려워 같은 효과를 주는 create() 메서드를 사용한다.
    try {
      const user = await this.usersModel.create({
        ...createUserDto,
        password: hashedPassword,
        roles,
      });

      return await user.save();
    } catch (error) {
      if (error.code === MongoDbErrorCode.DUPLICATE_KEY) {
        throw new ConflictException('이메일 사용 중.');
      }

      throw error;
    }
  }

  async createWithOAuth(oAuthProfileDto: OAuthProfileDto): Promise<User> {
    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(oAuthProfileDto.oAuthProviderId, salt);
    const roles = [Role.USER];

    const user = await this.usersModel.create({
      ...oAuthProfileDto,
      password,
      roles,
    });

    return await user.save();
  }

  async update(
    filter: FilterQuery<User>,
    updateUserDto: Partial<User>,
  ): Promise<User> {
    // 기본적으로 findOneAndUpdate()는 업데이트가 적용되기 전의 도큐먼트를 반환하지만 new: true를 설정하면 업데이트가 적용된 후의 객체를 제공한다.
    return await this.usersModel.findOneAndUpdate(filter, updateUserDto, {
      new: true,
    });
  }

  async setRefreshToken(
    _id: MongooseSchema.Types.ObjectId,
    refreshToken: string,
  ) {
    const salt = await bcrypt.genSalt();
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
    const filter = buildFilter('_id', _id);

    return await this.update(filter, {
      refreshToken: hashedRefreshToken,
    });
  }

  async removeRefreshToken(_id: MongooseSchema.Types.ObjectId) {
    const filter = buildFilter('_id', _id);

    return await this.update(filter, { refreshToken: null });
  }

  async findByRefreshToken(
    _id: MongooseSchema.Types.ObjectId,
    refreshToken: string,
  ): Promise<User> {
    const filter = buildFilter('_id', _id);
    const user = await this.findOne(filter);

    const refreshTokenMatch = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatch) {
      throw new NotFoundException('새로고침 토큰 불일치.');
    }

    return user;
  }

  async findOne(filter: FilterQuery<User>): Promise<User> {
    const user = await this.usersModel.findOne(filter).lean();

    if (!user) {
      throw new NotFoundException('존재하지 않는 사용자.');
    }

    return user;
  }

  async exists(filter: FilterQuery<User>): Promise<User> {
    return await this.usersModel.exists(filter).lean();
  }
}
