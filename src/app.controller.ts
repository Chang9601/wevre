import { Controller, Get, HttpStatus, Redirect } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Redirect('http://127.0.0.1:3000/index', HttpStatus.FOUND)
  redirectToWevre() {
    return;
  }
}
