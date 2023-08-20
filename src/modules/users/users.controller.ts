import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  //SerializeOptions,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from '../../dtos/create-user.dto';
import { SigninDto } from '../../dtos/signin.dto';

@Controller('users')
//@SerializeOptions({ 전역 설정 직렬화
//  strategy: 'excludeAll',
//})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/signup')
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;
    const userId = await this.usersService.create(name, email, password);

    return userId;
  }

  @Post('/signin')
  @HttpCode(HttpStatus.OK)
  async signin(@Body() signinDto: SigninDto) {
    const { email, password } = signinDto;
    const accessToken = await this.usersService.signin(email, password);

    return accessToken;
  }
}
