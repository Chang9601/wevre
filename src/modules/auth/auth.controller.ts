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
import { CreateUserDto } from '../../dtos/create-user.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import RequestWithUser from './interfaces/requestWithUser.interface';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
//@SerializeOptions({ 전역 설정 직렬화
//  strategy: 'excludeAll',
//})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;
    const id = await this.authService.signup(name, email, password);

    return id;
  }

  @Post('/signin')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async signin(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user;
    const { token } = await this.authService.signin(user._id);
    const expiration = 1 * 24 * 60 * 60 * 1000;

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        expires: new Date(Date.now() + expiration),
      })
      .send({ message: 'success' });
  }

  @Post('/signout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  signout(@Res() res: Response) {
    res
      .cookie('token', '', {
        maxAge: 0,
      })
      .send({ message: 'success' });
  }

  @Get('/token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  getToken(@Req() req: RequestWithUser) {
    const token = req.cookies.token;

    return token;
  }

  @Get('/user')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  getUser(@Req() req: RequestWithUser) {
    const user = req.user;

    return user;
  }
}
