import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import { serialize, parse } from 'cookie';
import { randomUUID } from 'crypto';

import { AuthService } from '../../../modules/auth/auth.service';
import { UsersService } from '../../../modules/users/users.service';
import { buildFilter } from '../../../common/factories/common.factory';

export class SocketIoAdapter extends IoAdapter {
  private readonly authService: AuthService;
  private readonly usersService: UsersService;

  constructor(private app: INestApplicationContext) {
    super(app);
    this.authService = this.app.get(AuthService);
    this.usersService = this.app.get(UsersService);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    // allowRequest() 메서드는 핸드셰이크 또는 업그레이드 요청을 첫 번째 매개변수로 받고 계속 진행할지 여부를 결정할 수 있는 함수이다.
    // initial_headers 이벤트와 함께 사용하여 클라이언트에 쿠키를 보내는 데에도 사용할 수 있다.
    options.allowRequest = async (request, allowFunction) => {
      const cookie = request.headers.cookie;

      // 쿠키에 토큰이 존재하지 않을 경우 accessToken 자체의 값이 없어서 서버가 다운되는 것을 방지한다.
      if (!cookie) {
        return allowFunction('권한 없음.', false);
      }

      const { access_token: accessToken } = parse(cookie);

      const isTokenValidated =
        accessToken && (await this.authService.validateToken(accessToken));

      if (!isTokenValidated) {
        return allowFunction('권한 없음.', false);
      }

      const filter = buildFilter('_id', isTokenValidated.id);

      const doesUserExist =
        isTokenValidated && (await this.usersService.findOne(filter));

      if (!doesUserExist) {
        return allowFunction('권한 없음.', false);
      }

      return allowFunction(null, true);
    };

    // allowRequest() 메서드에 설정한 옵션을 전달하여 서버를 생성한다.
    const server: Server = super.createIOServer(port, options);

    // initial_headers 이벤트는 세션의 1번째 HTTP 요청 (핸드셰이크)의 응답 헤더를 쓰기 직전에 발생하며 사용자 정의할 수 있도록 허용한다.
    server.engine.on('initial_headers', (headers, request) => {
      const session = this.getCookie('socket_session_id', request);
      if (!session) {
        headers['set-cookie'] = serialize(`socket_session_id`, randomUUID(), {
          path: '/',
          // 프론트엔드가 쿠키에 접근해야 하기 때문에 세션 쿠키는 접근 토큰 쿠키와 달리 HttpOnly를 false로 설정한다..
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
