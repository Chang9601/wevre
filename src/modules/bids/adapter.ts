import { Injectable } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import * as Cookie from 'cookie';

@Injectable()
export class CustomSocketIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    // If you have an existing HTTP server instance, you can pass it as the second argument here.
    //const httpServer = this.httpServer;

    // Customize your cookie options here.
    // const setCookie = Cookie.serialize('session_id', '14142414', {
    //   httpOnly: false,
    //   secure: false,
    //   sameSite: 'lax',
    //   expires: new Date(Date.now() + 1800000),
    // });

    const setCookie: Cookie.CookieSerializeOptions & { name: string } = {
      name: 'session_id',
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      expires: new Date(Date.now() + 1800000),
    };

    // Override the cookie option in the Socket.IO configuration.
    options.cookie = setCookie;

    return super.createIOServer(port, options);
  }
}
