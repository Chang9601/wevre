import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import { serialize, parse } from 'cookie';

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

  createIOServer(port: number, options?: ServerOptions): any {
    options.allowRequest = async (request, allowFunction) => {
      const cookie = request.headers.cookie;
      console.log('xxxxxxxxxxx');

      const {
        [`access_token_silvia@naver.com`]: accessToken,
        session_id: sessionId,
      } = parse(cookie);

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

    const server: Server = super.createIOServer(port, options);

    server.engine.on('initial_headers', (headers, _) => {
      headers['set-cookie'] = serialize('session_id', '12311323', {
        path: '/',
        sameSite: 'strict',
        expires: new Date(Date.now() + 1800000),
      });
    });

    return server;
  }
}
