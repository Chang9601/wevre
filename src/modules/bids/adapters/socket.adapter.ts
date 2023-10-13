import { Injectable } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { parse } from 'cookie';

import { SetCookieType } from '../types/set-cookie.type';

@Injectable()
export class SocketIoAdapter extends IoAdapter {
  // private authService: AuthService;
  // private usersService: UsersService;

  // constructor(private app: INestApplicationContext) {
  //   super(app);
  //   this.app.resolve<AuthService>(AuthService).then((authService) => {
  //     this.authService = authService;
  //   });

  //   this.app.resolve<UsersService>(UsersService).then((usersService) => {
  //     this.usersService = usersService;
  //   });
  // }

  createIOServer(port: number, options?: ServerOptions): any {
    // options.allowRequest = async (request, allowFunction) => {
    //   const cookie = request.headers.cookie;

    //   const { [`access_token_dongim@naver.com`]: accessToken } = parse(cookie);

    //   if (accessToken) {
    //     const payload = await this.authService.verifyToken(accessToken);
    //     if (payload) {
    //       const user = await this.usersService.findById(payload.id);

    //       if (user) {
    //         return allowFunction(null, true);
    //       }
    //     }
    //   }

    //   return allowFunction('Unauthorized', false);
    // };

    options.allowRequest = async (request, allowFunction) => {
      const cookie = request.headers.cookie;
      const { session_id: sessionId } = parse(cookie);

      if (!sessionId) {
        const setCookie: SetCookieType = {
          name: 'session_id',
          httpOnly: false,
          secure: false,
          sameSite: 'strict',
          expires: new Date(Date.now() + 1800000),
        };

        options.cookie = setCookie;
      }

      return allowFunction(null, true);
    };

    return super.createIOServer(port, options);
  }
}
