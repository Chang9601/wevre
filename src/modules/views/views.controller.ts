import { Controller, Get, HttpCode, HttpStatus, Render } from '@nestjs/common';

import { ViewsService } from './views.service';

@Controller()
export class ViewsController {
  constructor(private readonly viewsService: ViewsService) {}

  @HttpCode(HttpStatus.OK)
  @Get('/signup')
  @Render('signup.ejs')
  async signUp() {
    const credentials = this.viewsService.findCredentials();

    return credentials;
  }

  @HttpCode(HttpStatus.OK)
  @Get('/signin')
  @Render('signin.ejs')
  async signIn() {
    const credentials = this.viewsService.findCredentials();

    return credentials;
  }
}
