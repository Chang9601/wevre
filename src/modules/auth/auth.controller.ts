import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

import { CreateUserDto } from '../../dtos/create-user.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RequestWithUser } from './interfaces/request-with-user.interface';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { User } from '../../entities/user.entity';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { createCookieOptions } from '../../utils/cookie-options.factory';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersSerivce: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Post('/signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;
    return await this.authService.signup(name, email, password);
  }

  @Post('/signin')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async signin(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    let { user } = request;
    const { accessToken } = await this.authService.createToken(user.id);
    const { refreshToken } = await this.authService.createRefreshToken(user.id);

    await this.usersSerivce.setRefreshToken(refreshToken, user._id);

    const accessTokenOptions = createCookieOptions(
      this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION'),
    );

    const refreshTokenOptions = createCookieOptions(
      this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION'),
    );
    refreshTokenOptions.httpOnly = true;

    // 프론트엔드가 토큰에 접근해야 하기 때문에 접근 토큰은 httpOnly: false
    response
      .cookie(`access_token_${user.email}`, accessToken, accessTokenOptions)
      .cookie(`refresh_token_${user.email}`, refreshToken, refreshTokenOptions);

    user = {
      name: user.name,
      email: user.email,
    } as User;

    response.send(user);
  }

  @Post('/signout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async signout(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.usersSerivce.removeRefreshToken(request.user.id);
    response
      .cookie('access_token', '', {
        maxAge: 0,
      })
      .cookie('refresh_token', '', { maxAge: 0 });
  }

  @Get('/refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  async refreshToken(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    let { user } = request;
    const { accessToken } = await this.authService.createToken(user.id);

    const accessTokenOptions = createCookieOptions(
      this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION'),
    );

    response.cookie(
      `access_token_{${user.email}}`,
      accessToken,
      accessTokenOptions,
    );

    user = {
      name: user.name,
      email: user.email,
    } as User;

    response.send(user);
  }
}
