import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import * as Cookie from 'cookie';

//import { SetCookieType } from '../types/set-cookie.type';
import { AuthService } from '../../../modules/auth/auth.service';
import { UsersService } from '../../../modules/users/users.service';

export class SocketIoAdapter extends IoAdapter {
  private readonly authService: AuthService;
  private readonly usersService: UsersService;

  constructor(private app: INestApplicationContext) {
    super(app);
    this.authService = this.app.get(AuthService);
    this.usersService = this.app.get(UsersService);
  }

  create(port: number, options?: ServerOptions): Server {
    const server = super.create(port, options);

    server.engine.on('initial_headers', (headers, _) => {
      headers['set-cookie'] = Cookie.serialize('session_id', 'vzvxvz', {
        path: '/',
        sameSite: 'strict',
        expires: new Date(Date.now() + 1800000),
      });
    });

    return server;
  }

  createIOServer(port: number, options?: ServerOptions): any {
    // const server = super.createIOServer(port, options);

    // server.engine.on('initial_headers', (headers, _) => {
    //   headers['set-cookie'] = Cookie.serialize('session_id', '12311323', {
    //     path: '/',
    //     sameSite: 'strict',
    //   });
    // });

    options.allowRequest = async (request, allowFunction) => {
      const cookie = request.headers.cookie;

      const {
        [`access_token_dongim@naver.com`]: accessToken,
        session_id: sessionId,
      } = Cookie.parse(cookie);

      const isTokenVerified =
        accessToken && (await this.authService.verifyToken(accessToken));
      const doesUserExist =
        isTokenVerified &&
        (await this.usersService.findById(isTokenVerified.id));

      if (!isTokenVerified || !doesUserExist) {
        console.log('123131');
        return allowFunction('Unauthorized', false);
      }

      console.log(`accessToken: ${accessToken}`);
      console.log(`sessionId: ${sessionId}`);

      return allowFunction(null, true);
    };

    return super.createIOServer(port, options);
  }
}
