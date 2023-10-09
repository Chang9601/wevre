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
  //SerializeOptions,
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

@Controller('auth')
//@SerializeOptions({ 전역 설정 직렬화
//  strategy: 'excludeAll',
//})
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

    // 토큰에 접근해야 하기 때문에 httpOnly: false
    response
      .cookie(`access_token_${user.email}`, accessToken, {
        domain: '127.0.0.1',
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        expires: new Date(
          Date.now() +
            parseInt(
              this.configService.get<string>(
                'JWT_ACCESS_TOKEN_EXPIRATION',
              ) as string,
            ),
        ),
      })
      .cookie(`refresh_token_${user.email}`, refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        expires: new Date(
          Date.now() +
            parseInt(
              this.configService.get<string>(
                'JWT_REFRESH_TOKEN_EXPIRATION',
              ) as string,
            ),
        ),
      });

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

    response.cookie(`access_token_{${user.email}}`, accessToken, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      expires: new Date(
        Date.now() +
          parseInt(
            this.configService.get<string>(
              'JWT_ACCESS_TOKEN_EXPIRATION',
            ) as string,
          ),
      ),
    });

    user = {
      name: user.name,
      email: user.email,
    } as User;

    response.send(user);
  }
}
