import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import { serialize, parse } from 'cookie';

import { AuthService } from '../../../modules/auth/auth.service';
import { UsersService } from '../../../modules/users/users.service';
import { randomUUID } from 'crypto';

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

      const { access_token: accessToken } = parse(cookie);

      const isTokenVerified =
        accessToken && (await this.authService.verifyToken(accessToken));
      const doesUserExist =
        isTokenVerified &&
        (await this.usersService.findById(isTokenVerified.id));

      if (!isTokenVerified || !doesUserExist) {
        return allowFunction('Unauthorized', false);
      }

      return allowFunction(null, true);
    };

    const server: Server = super.createIOServer(port, options);

    server.engine.on('initial_headers', (headers, request) => {
      const session = this.getCookie('session_id', request);
      if (!session) {
        headers['set-cookie'] = serialize(`session_id`, randomUUID(), {
          path: '/',
          httpOnly: false,
          secure: false,
          sameSite: 'strict',
          expires: new Date(Date.now() + 1800000),
        });
      }
    });

    return server;
  }

  private getCookie(name: string, request: any) {
    const cookies = parse(request.headers.cookie || '');
    return cookies[name];
  }
}
