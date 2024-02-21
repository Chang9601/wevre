import { randomUUID } from 'crypto';

import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { serialize, parse } from 'cookie';
import { Redis } from 'ioredis';

import { AuthService } from '../../../modules/auth/auth.service';
import { UsersService } from '../../../modules/users/users.service';
import { buildFilter } from '../../../common/factories/common.factory';

export class SocketIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  private readonly authService: AuthService;
  private readonly usersService: UsersService;

  constructor(private app: INestApplicationContext) {
    super(app);
    this.authService = this.app.get(AuthService);
    this.usersService = this.app.get(UsersService);
  }

  async connectToRedis(): Promise<void> {
    const redisOptions = {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
    };

    // 발행(publish)/구독(subscribe) 메시징 패러다임
    // 발신자(게시자)는 메시지를 특정 수신자(구독자)에게 보내도록 프로그래밍되지 않으며 발행된 메시지는 어떤 구독자가 있는지 알지 못한 채로 채널로 분류되어 있다.
    // 구독자는 하나 이상의 채널에 관심을 표현하고 게시자가 누구인지 알지 못한 채 관심 있는 메시지만을 받는다.
    // 게시자와 구독자 간의 이러한 디커플링은 더 큰 확장성과 동적인 네트워크 토폴로지를 허용한다.
    const pubClient = new Redis(redisOptions); // 발행 클라이언트
    const subClient = pubClient.duplicate(); // 구독 클라이언트

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    // allowRequest() 메서드는 핸드셰이크 또는 업그레이드 요청을 1번 매개변수로 받고 계속 진행할지 여부를 결정할 수 있는 함수이다.
    // initial_headers 이벤트와 함께 사용하여 클라이언트에 쿠키를 보낼 경우에 사용할 수 있다.
    options.allowRequest = async (request, allowFunction) => {
      const cookie = request.headers.cookie;
      const message = '권한 없음.';

      // 쿠키에 토큰이 존재하지 않을 경우 접근 토큰 자체의 값(accessToken)이 없어서 서버가 다운되는 것을 방지한다.
      if (!cookie) {
        return allowFunction(message, false);
      }

      const { access_token: accessToken } = parse(cookie);

      const isTokenValidated =
        accessToken && (await this.authService.validateToken(accessToken));

      if (!isTokenValidated) {
        return allowFunction(message, false);
      }

      const filter = buildFilter('_id', isTokenValidated.id);

      const doesUserExist =
        isTokenValidated && (await this.usersService.findOne(filter));

      if (!doesUserExist) {
        return allowFunction(message, false);
      }

      return allowFunction(null, true);
    };

    // allowRequest() 메서드에 설정한 옵션을 전달하여 서버를 생성한다.
    const server: Server = super.createIOServer(port, options);

    // initial_headers 이벤트는 세션의 1번 HTTP 요청 (핸드셰이크)의 응답 헤더를 쓰기 직전에 발생하며 사용자 정의할 수 있도록 허용한다.
    // 쿠키에 세션을 저장하면 재연결 및 페이지 새로 고침 시 세션이 보존되며 세션은 브라우저 탭 간에 공유된다.
    server.engine.on('initial_headers', (headers, request) => {
      const session = this.getCookie('socket_session_id', request);
      if (!session) {
        headers['set-cookie'] = serialize(`socket_session_id`, randomUUID(), {
          path: '/',
          // 프론트엔드가 쿠키에 접근해야 하기 때문에 소켓 세션 쿠키는 접근 토큰 쿠키와 달리 HttpOnly를 false로 설정한다.
          httpOnly: false,
          secure: false,
          sameSite: 'strict',
          expires: new Date(
            Date.now() + parseInt(process.env.SOCKET_SESSION_EXPIRATION),
          ),
        });
      }
    });

    server.adapter(this.adapterConstructor);

    return server;
  }

  private getCookie(name: string, request: any) {
    const cookies = parse(request.headers.cookie || '');

    return cookies[name];
  }
}
