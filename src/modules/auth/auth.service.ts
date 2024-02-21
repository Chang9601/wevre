import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Schema as MongooseSchema } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import axios from 'axios';

import { CreateUserDto } from '../../dtos/create-user.dto';
import { OAuthAuthorizationCodeDto } from '../../dtos/oauth-authorization-code.dto';
import { OAuthAcessTokenDto } from '../../dtos/oauth-access-token.dto';
import { OAuthProfileDto } from '../../dtos/oauth-profile.dto';
import { User } from '../../entities/user.entity';
import { UsersService } from '../users/users.service';
import { TokenPayload } from './interfaces/token-payload.interface';
import { IJwtToken } from '../../interfaces/types.interface';
import { OAuthProvider, Token } from '../../common/enums/common.enum';
import { buildFilter } from '../../common/factories/common.factory';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  async validateCredentials(email: string, password: string): Promise<User> {
    const filter = buildFilter('email', email);

    try {
      // Mongoose에서 쿼리를 수행할 때 실제로 쿼리를 실행하기 위해 exec() 메서드를 사용할 수 있다.
      // 그러나 Mongoose 버전 4.x부터는 exec() 메서드가 필수가 아니며 쿼리를 기다리면 자동으로 실행된다.
      const user = await this.usersService.findOne(filter);
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        throw new BadRequestException();
      }

      return user;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw new BadRequestException(
          '유효하지 않은 이메일 혹은 유효하지 않은 비밀번호.',
        );
      }

      throw error;
    }
  }

  async validateToken(token: string): Promise<TokenPayload> {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    });

    return payload;
  }

  async createToken(
    id: MongooseSchema.Types.ObjectId,
    type: Token,
  ): Promise<IJwtToken> {
    const payload: TokenPayload = { id };
    const tokenSecret =
      type === Token.ACCESS_TOKEN
        ? 'JWT_ACCESS_TOKEN_SECRET'
        : 'JWT_REFRESH_TOKEN_SECRET';
    const tokenExpiresIn =
      type === Token.ACCESS_TOKEN
        ? 'JWT_ACCESS_TOKEN_EXPIRATION'
        : 'JWT_REFRESH_TOKEN_EXPIRATION';

    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>(tokenSecret),
      expiresIn: this.configService.get<string>(tokenExpiresIn),
    });

    return { token };
  }

  async findOrCreateGoogle(
    oAuthAuthorizationCodeDto: OAuthAuthorizationCodeDto,
  ): Promise<User> {
    const { code, error } = oAuthAuthorizationCodeDto;

    if (error) {
      throw new Error(error);
    }

    const clientId = this.configService.get<string>(
      'GOOGLE_CLIENT_ID',
    ) as string;
    const clientSecret = this.configService.get<string>(
      'GOOGLE_CLIENT_SECRET',
    ) as string;
    const callbackUri = this.configService.get<string>(
      'GOOGLE_CALLBACK_URI',
    ) as string;

    const grantType = 'authorization_code';

    const oAuthAcessTokenDto: OAuthAcessTokenDto = {
      grant_type: grantType,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: callbackUri,
      code,
    };

    const accessTokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      oAuthAcessTokenDto,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        responseType: 'json',
      },
    );

    const { access_token: accessToken, refresh_token: refreshToken } =
      accessTokenResponse.data;

    const oAuthProviderRefreshToken = refreshToken;

    const profileResponse = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      },
    );

    const { data } = profileResponse;
    const { name, email, id } = data;

    const oAuthProviderId = id;
    const oAuthProvider = OAuthProvider.GOOGLE;

    const oAuthProfileDto: Partial<OAuthProfileDto> = {
      name,
      email,
      oAuthProvider,
      oAuthProviderId,
      oAuthProviderRefreshToken,
    };

    const filter = buildFilter('email', email);

    const exist = await this.usersService.exists(filter);

    if (exist) {
      const user = await this.usersService.findOne(filter);

      if (user.oAuthProvider !== OAuthProvider.GOOGLE) {
        throw new ConflictException('이메일 사용 중.');
      }

      return user;
    }

    return await this.usersService.createWithOAuth(
      oAuthProfileDto as OAuthProfileDto,
    );
  }

  async findOrCreateNaver(
    oAuthAuthorizationCodeDto: OAuthAuthorizationCodeDto,
  ): Promise<User> {
    const { code, error: codeError, state } = oAuthAuthorizationCodeDto;

    if (codeError) {
      throw new Error(codeError);
    }

    const clientId = this.configService.get<string>(
      'NAVER_CLIENT_ID',
    ) as string;
    const clientSecret = this.configService.get<string>(
      'NAVER_CLIENT_SECRET',
    ) as string;
    const grantType = 'authorization_code';

    const oAuthAcessTokenDto: OAuthAcessTokenDto = {
      grant_type: grantType,
      client_id: clientId,
      client_secret: clientSecret,
      code,
      state,
    };

    const accessTokenResponse = await axios.post(
      'https://nid.naver.com/oauth2.0/token',
      oAuthAcessTokenDto,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        responseType: 'json',
      },
    );

    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      error: tokenError,
    } = accessTokenResponse.data;

    if (tokenError) {
      throw new Error(tokenError);
    }

    const profileResponse = await axios.get(
      'https://openapi.naver.com/v1/nid/me',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const { response: profile } = profileResponse.data;

    const { id: oAuthProviderId, name, email } = profile;

    const oAuthProvider = OAuthProvider.NAVER;
    const oAuthProviderRefreshToken = refreshToken;

    const filter = buildFilter('email', email);

    const exist = await this.usersService.exists(filter);

    if (exist) {
      const user = await this.usersService.findOne(filter);

      if (user.oAuthProvider !== OAuthProvider.NAVER) {
        throw new ConflictException('이메일 사용 중.');
      } else {
        const filter = buildFilter('_id', user._id);

        return await this.usersService.update(
          filter,
          oAuthProviderRefreshToken,
        );
      }
    }

    const oAuthProfileDto: Partial<OAuthProfileDto> = {
      name,
      email,
      oAuthProvider,
      oAuthProviderId,
      oAuthProviderRefreshToken,
    };

    return await this.usersService.createWithOAuth(
      oAuthProfileDto as OAuthProfileDto,
    );
  }
}
