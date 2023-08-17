import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from '../../dtos/create-user.dto';

import { SigninDto } from '../../dtos/signin.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/signup')
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;
    const userId = await this.usersService.createUser(name, email, password);

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
