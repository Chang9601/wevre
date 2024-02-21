import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CreateUserDto } from '../../dtos/create-user.dto';
import { SignInDto } from '../../dtos/signin.dto';
import { UserDto } from '../../dtos/user.dto';
import { OAuthAuthorizationCodeDto } from '../../dtos/oauth-authorization-code.dto';
import { User } from '../../entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RequestWithUser } from './interfaces/request-with-user.interface';
import { Serialize } from '../../interceptors/serialize.interceptor';
import { createCookieOptions } from '../../common/factories/common.factory';
import { Token } from '../../common/enums/common.enum';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersSerivce: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @ApiConflictResponse({
    description: '이미 회원가입된 이메일로 회원가입 시도.',
  })
  @ApiCreatedResponse({
    type: UserDto,
    description: '회원가입 성공.',
  })
  @ApiBody({
    type: CreateUserDto,
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('/signup')
  async signUp(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.authService.signUp(createUserDto);
  }

  @ApiBadRequestResponse({
    description: '잘못된 이메일 혹은 비밀번호로 로그인 시도.',
  })
  @ApiOkResponse({
    type: UserDto,
    description: '로그인 성공.',
  })
  @ApiBody({
    type: SignInDto,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('/signin')
  async signIn(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const { user } = request;
    const { token: accessToken } = await this.authService.createToken(
      user._id,
      Token.ACCESS_TOKEN,
    );
    const { token: refreshToken } = await this.authService.createToken(
      user._id,
      Token.REFRESH_TOKEN,
    );

    await this.usersSerivce.setRefreshToken(user._id, refreshToken);

    const accessTokenOptions = createCookieOptions(
      this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION'),
    );
    const refreshTokenOptions = createCookieOptions(
      this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION'),
    );

    const { name, email } = user;
    const userDto = new UserDto(name, email);

    response
      .cookie(`access_token`, accessToken, accessTokenOptions)
      .cookie(`refresh_token`, refreshToken, refreshTokenOptions)
      .send(userDto);
  }

  @ApiUnauthorizedResponse({
    description: '인증되지 않아 API 사용 불가능.',
  })
  @ApiNoContentResponse({
    description: '로그아웃 성공.',
  })
  @ApiCookieAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Post('/signout')
  async signout(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.usersSerivce.removeRefreshToken(request.user._id);

    // 소켓 세션 아이디를 제거하면 경매방 입장 시 불필요하게 많은 세션이 생성되어 로그아웃 시 제거하지 않는다.
    response.clearCookie('access_token').clearCookie('refresh_token');
    //      .clearCookie('socket_session_id');
  }

  @ApiUnauthorizedResponse({
    description: '인증되지 않아 API 사용 불가능.',
  })
  @ApiOkResponse({
    type: UserDto,
    description: '접근 토큰 갱신.',
  })
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @Post('/refresh')
  async refreshToken(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const { user } = request;
    const { token: accessToken } = await this.authService.createToken(
      user._id,
      Token.ACCESS_TOKEN,
    );

    const accessTokenOptions = createCookieOptions(
      this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION'),
    );

    const { name, email } = user;
    const userDto = new UserDto(name, email);

    response
      .cookie(`access_token`, accessToken, accessTokenOptions)
      .send(userDto);
  }

  @ApiUnauthorizedResponse({
    description: '인증되지 않아 API 사용 불가능.',
  })
  @ApiOkResponse({
    type: UserDto,
    description: '인증된 사용자 반환.',
  })
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  @Serialize(UserDto)
  @UseGuards(JwtAuthGuard)
  @Get('/whoami')
  async whoAmI(@Req() request: RequestWithUser): Promise<User> {
    const { user } = request;

    return user;
  }

  @Get('/google')
  async signInWithGoogle(
    @Res({ passthrough: true }) response: Response,
    @Query() oAuthAuthorizationCodeDto: OAuthAuthorizationCodeDto,
  ): Promise<void> {
    const user = await this.authService.findOrCreateGoogle(
      oAuthAuthorizationCodeDto,
    );

    const { token: accessToken } = await this.authService.createToken(
      user._id,
      Token.ACCESS_TOKEN,
    );
    const { token: refreshToken } = await this.authService.createToken(
      user._id,
      Token.REFRESH_TOKEN,
    );

    await this.usersSerivce.setRefreshToken(user._id, refreshToken);

    const accessTokenOptions = createCookieOptions(
      this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION') as string,
    );
    const refreshTokenOptions = createCookieOptions(
      this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION') as string,
    );

    response
      .cookie(`access_token`, accessToken, accessTokenOptions)
      .cookie(`refresh_token`, refreshToken, refreshTokenOptions)
      .redirect('/');
  }

  @Get('/naver')
  async signInWithNaver(
    @Res({ passthrough: true }) response: Response,
    @Query() oAuthAuthorizationCodeDto: OAuthAuthorizationCodeDto,
  ): Promise<void> {
    const user = await this.authService.findOrCreateNaver(
      oAuthAuthorizationCodeDto,
    );

    const { token: accessToken } = await this.authService.createToken(
      user._id,
      Token.ACCESS_TOKEN,
    );
    const { token: refreshToken } = await this.authService.createToken(
      user._id,
      Token.REFRESH_TOKEN,
    );

    await this.usersSerivce.setRefreshToken(user._id, refreshToken);

    const accessTokenOptions = createCookieOptions(
      this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION') as string,
    );
    const refreshTokenOptions = createCookieOptions(
      this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION') as string,
    );

    response
      .cookie(`access_token`, accessToken, accessTokenOptions)
      .cookie(`refresh_token`, refreshToken, refreshTokenOptions)
      .redirect('/');
  }
}
