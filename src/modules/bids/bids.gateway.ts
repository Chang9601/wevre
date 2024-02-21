import { UseFilters, UseGuards } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Schema as MongooseSchema } from 'mongoose';
import { parse } from 'cookie';
import { Redis } from 'ioredis';

import { LeaveRoomDto } from '../../dtos/leave-room.dto';
import { JoinRoomDto } from '../../dtos/join-room.dto';
import { MakeBidDto } from '../../dtos/make-bid.dto';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { BidsService } from './bids.service';
import { WebsocketExceptionFilter } from '../../filters/ws-exception.filter';
import { WsJwtAuthGuard } from './guards/ws-jwt-auth.guard';
import { buildFilter } from '../../common/factories/common.factory';
import { SocketSessionStore } from './socket-session-store';

// 게이트웨이는 프로바이더로 취급될 수 있으며 이는 게이트웨이가 클래스 생성자를 통해 의존성 주입될 수 있음을 의미한다.
// 또한, 게이트웨이는 다른 클래스(프로바이더 및 컨트롤러)에 의해 주입될 수도 있다.
// 일반적으로 각 게이트웨이는 HTTP 서버와 동일한 포트에서 듣고 있다.
@WebSocketGateway({
  cors: {
    // Access-Control-Allow-Origin 응답 헤더는 응답이 주어진 출처(origin)의 요청 코드와 공유될 수 있는지 여부를 나타낸다.
    // 출처는 자원에 접근하는 데 사용된 URL의 프로토콜, 호스트명(도메인) 및 포트에 의해 정의된다. 두 객체가 동일한 출처을 가지려면 프로토콜, 호스트명 및 포트가 모두 일치해야 한다.
    // origin은 출처를 지정하는데 하나의 출처만 지정할 수 있다. 서버가 여러 출처의 클라이언트를 지원하는 경우 해당 요청을 하는 특정 클라이언트의 출처를 반환해야 한다.
    // 만약 서버가 "*" 와일드카드 대신에 요청 출처를 허용 목록의 일부로서 동적으로 변경할 수 있는 단일 출처를 지정한다면, Vary 응답 헤더에 Origin을 포함해야 한다.
    // 이는 클라이언트에게 서버 응답이 Origin 요청 헤더의 값에 따라 다를 수 있음을 알려준다.
    origin:
      process.env.NODE_ENV === 'production'
        ? false
        : ['http://127.0.0.1:3000', 'http://localhost:3000'],
    // Access-Control-Allow-Credentials 응답 헤더는 브라우저에게 서버가 교차 출처 HTTP 요청에 자격 증명을 포함할지 여부를 알려준다.
    // 자격 증명은 쿠키, TLS 클라이언트 인증서 또는 사용자 이름과 비밀번호를 포함하는 인증 헤더이다. 기본적으로 이러한 자격 증명은 교차 출처 요청에 전송되지 않는데 이렇게 하면 사이트가 CSRF 공격에 취약해질 수 있기 때문이다.
    credentials: true,
    // Access-Control-Allow-Methods 응답 헤더는 사전 검사 요청(preflight request)에 대한 응답으로 자원에 접근할 때 허용되는 하나 이상의 메서드를 지정한다.
    // method는 허용된 HTTP 요청 메서드를 쉼표로 구분한 목록.
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
})
// 웹소켓 예외 필터는 작동하나 코드 수정이 필요하다.
// 웹소켓 가드는 확인이 필요하다.
@UseFilters(WebsocketExceptionFilter)
@UseGuards(WsJwtAuthGuard)
export class BidsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  // 서버 인스턴스
  @WebSocketServer()
  server: Server;

  private readonly redisOptions = {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
  };

  // 애플리케이션을 인 메모리로 사용하면 단일 Socket.IO 서버에서만 작동한다.
  //connections: Map<string, MongooseSchema.Types.ObjectId> = new Map();
  socketSessionStore: SocketSessionStore = new SocketSessionStore(
    new Redis(this.redisOptions),
  );

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly bidsService: BidsService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      // handshake 객체는 Socket.IO 세션의 시작 부분에서 발생하는 핸드셰이크에 대한 세부 정보를 포함한다.
      // headers는 초기 요청의 헤더.
      // query는 초기 요청의 쿼리 매개변수.
      const cookie = client.handshake.headers.cookie;
      const [itemId] = client.handshake.query.item_id;
      const roomId: unknown = client.handshake.query.room_id;

      const { socket_session_id: socketSessionId } = parse(cookie);
      const { access_token: accessToken } = parse(cookie);

      const payload = await this.authService.validateToken(accessToken);

      const filter = buildFilter('_id', payload.id);
      const user = payload && (await this.usersService.findOne(filter));

      if (!itemId) {
        throw new WsException('아이디에 해당하는 상품 없음.');
      }

      if (!roomId) {
        throw new WsException('아이디에 해당하는 경매방 없음.');
      }

      if (socketSessionId) {
        // 각 소켓은 자동으로 해당 아이디(id)로 식별되는 방(room)에 참여한다.
        // 방은 소켓이 참여하고 나갈 수 있는 임의의 채널로 사용하여 이벤트를 일부 클라이언트에게 브로드캐스트할 수 있다.
        // 아이디는 일시적이기 때문에 애플리케이션에서 사용되지 않아야 한다.
        // 따라서, 세션 아이디(쿠키로 전송 혹은 localStorage에 저장하고 인증 페이로드로 전송)가 존재하는 경우 사용자의 아이디 방에 참가한다.
        client.join(user._id.toString());
        //this.connections.set(socketSessionId, user._id);
        this.socketSessionStore.save(socketSessionId, user._id);
      }

      await this.joinRoom(client, {
        roomId: roomId as MongooseSchema.Types.ObjectId,
      });
    } catch (error) {
      client.emit('error', error);
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {
    client.disconnect(true);
  }

  @SubscribeMessage('join')
  async joinRoom(client: Socket, joinRoomDto: JoinRoomDto): Promise<void> {
    try {
      const { roomId } = joinRoomDto;

      await client.join(roomId.toString());
    } catch (error) {
      error.message = '경매방 입장 중 오류 발생.';

      client.emit('error', error);
      client.disconnect(true);
    }
  }

  @SubscribeMessage('leave')
  async leaveRoom(client: Socket, leaveRoomDto: LeaveRoomDto): Promise<void> {
    try {
      const { roomId } = leaveRoomDto;

      // 방은 연결이 해제될 때 자동으로 나가게 된다.
      return await client.leave(roomId.toString());
    } catch (error) {
      error.message = '경매방 퇴장 중 오류 발생.';

      client.emit('error', error);
      client.disconnect(true);
    }
  }

  @SubscribeMessage('bid')
  async makeBid(client: Socket, makeBidDto: MakeBidDto): Promise<void> {
    try {
      const cookie = client.handshake.headers.cookie;
      const { socket_session_id: socketSessionId } = parse(cookie);
      //const userId = this.connections.get(socketSessionId);
      const userId = await this.socketSessionStore.find(socketSessionId);

      const filter = buildFilter('_id', userId);
      const user = await this.usersService.findOne(filter);

      let bid: string;
      makeBidDto.userId = userId;
      // of("/").fetchSocket()의 별칭.
      // fetchSockets() 메서드는 어댑터가 있는 여러 Socket.IO 서버의 클러스터 내에서도 작동한다.
      // 주어진 노드에서 소켓 인스턴스만 반환하려면 local 플래그를 사용해야 한다.
      // 해당 경매방에 존재하는 모든 소켓 인스턴스를 반환한다.
      const sockets = await this.server
        .in(makeBidDto.roomId.toString())
        .fetchSockets();

      for (const socket of sockets) {
        bid = socket.rooms.has(userId.toString())
          ? `본인: ${makeBidDto.price}원`
          : `${user.name}(${user.email}): ${makeBidDto.price}원`;

        if (client.rooms.has(userId.toString())) {
          // 브라우저에서 사용자가 여러 개의 탭을 사용하는 경우 전달되는 메시지.
          socket.emit('bid', bid);
        } else {
          // 다른 사용자에게 전달되는 메시지.
          client.to(socket.id).emit('bid', bid);
        }
      }

      await this.bidsService.create(makeBidDto);
    } catch (error) {
      error.message = '입찰 중 오류 발생.';

      client.emit('error', error);
      client.disconnect(true);
    }
  }
}
