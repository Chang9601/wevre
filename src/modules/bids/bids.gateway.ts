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

import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import {
  // BadRequestException,
  // InternalServerErrorException,
  //NotFoundException,
  // UnauthorizedException,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { RoomsService } from '../rooms/rooms.service';
import { SendMessageDto } from '../../dtos/send-message.dto';
import { WebsocketExceptionFilter } from '../../filter/ws-exception.filter';
import { WsJwtAuthGuard } from './guards/ws-jwt-auth.guard';
import { LeaveRoomDto } from 'src/dtos/leave-room.dto';
import { JoinRoomDto } from 'src/dtos/join-room.dto';

@WebSocketGateway({
  // 운영 환경에서는 CORS를 비활성화 하지만 개발 환경에서는 호스트는 127.0.0.1 또는 localhost만 CORS 활성화한다.
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? false
        : ['http://127.0.0.1:3000', 'http://localhost:3000'],
    // 쿠키 사용 시 필요한 속성.
    credentials: true,
  },
})
// 웹소켓 예외 필터는 작동하나 코드 수정이 필요하다.
// 웹소켓 가드 필터는 확인이 필요하다.
@UseFilters(WebsocketExceptionFilter)
@UseGuards(WsJwtAuthGuard)
export class BidsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  connections: Map<string, MongooseSchema.Types.ObjectId> = new Map();

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly roomsSerivce: RoomsService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const cookie = client.handshake.headers.cookie;
      const [itemId] = client.handshake.query.item_id;
      const roomId: unknown = client.handshake.query.room_id;

      const { session_id: sessionId } = parse(cookie);
      const { access_token: accessToken } = parse(cookie);

      const payload = await this.authService.verifyToken(accessToken);
      const user = payload && (await this.usersService.findById(payload.id));

      if (sessionId) {
        // 세션이 존재하는 경우 사용자의 아이디 방에 참가한다.
        client.join(user._id.toString());
        this.connections.set(sessionId, user._id);
      }

      if (!itemId) {
        throw new WsException('아이디에 해당하는 상품 없음.');
      }

      if (!roomId) {
        throw new WsException('아이디에 해당하는 경매방 없음');
      }

      await this.joinRoom(client, {
        roomId: roomId as MongooseSchema.Types.ObjectId,
      });
    } catch (error) {
      client.emit('error', error);
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    //const cookie = client.handshake.headers.cookie;
    //const { session_id: sessionId } = parse(cookie);

    // 경매방 퇴장 시 세션을 제거할 필요가 있는 지 고민 중
    //this.connections.delete(sessionId);
    client.disconnect(true);
  }

  @SubscribeMessage('join')
  async joinRoom(client: Socket, joinRoomDto: JoinRoomDto) {
    try {
      // const cookie = client.handshake.headers.cookie;
      // const { session_id: sessionId } = parse(cookie);
      const { roomId } = joinRoomDto;
      // const userId = this.connections.get(sessionId);

      // const user = await this.usersService.findById(userId);
      await client.join(roomId.toString());

      // const sockets = await this.server.in(roomId.toString()).fetchSockets();
      // for (const socket of sockets) {
      //   const otherCookie = socket.handshake.headers.cookie;
      //   const { session_id: otherSessionId } = parse(otherCookie);
      //   if (sessionId !== otherSessionId) {
      //     this.server
      //       .to(socket.id)
      //       .emit('join', `${user.name}(${user.email})님이 참가하셨습니다.`);
      //   }
      // }
    } catch (error) {
      error.message = '경매방 입장 중 오류 발생.';

      client.emit('error', error);
      client.disconnect(true);
    }
  }

  @SubscribeMessage('leave')
  async leaveRoom(client: Socket, leaveRoomDto: LeaveRoomDto) {
    try {
      // const cookie = client.handshake.headers.cookie;
      // const { session_id: sessionId } = parse(cookie);
      const { roomId } = leaveRoomDto;
      // const userId = this.connections.get(sessionId);

      // const user = await this.usersService.findById(userId);
      // 연결 종료 시 모든 방 퇴장인데 필요한지 여부 고민 중
      await client.leave(roomId.toString());

      // const sockets = await this.server.in(roomId.toString()).fetchSockets();
      // for (const socket of sockets) {
      //   const otherCookie = socket.handshake.headers.cookie;
      //   const { session_id: otherSessionId } = parse(otherCookie);
      //   if (sessionId !== otherSessionId) {
      //     this.server
      //       .to(socket.id)
      //       .emit('leave', `${user.name}(${user.email})님이 나가셨습니다.`);
      //   }
      // }
    } catch (error) {
      error.message = '경매방 퇴장 중 오류 발생.';

      client.emit('error', error);
      client.disconnect(true);
    }
  }

  @SubscribeMessage('message')
  async sendMessage(client: Socket, sendMessageDto: SendMessageDto) {
    try {
      const cookie = client.handshake.headers.cookie;
      const { session_id: sessionId } = parse(cookie);
      const userId = this.connections.get(sessionId);
      const user = await this.usersService.findById(userId);

      let message: string;
      sendMessageDto.userId = userId;
      // 해당 경매방에 존재하는 모든 소켓 인스턴스를 반환한다.
      const sockets = await this.server
        .in(sendMessageDto.roomId.toString())
        .fetchSockets();

      for (const socket of sockets) {
        message = socket.rooms.has(userId.toString())
          ? `본인: ${sendMessageDto.content}원`
          : `${user.name}(${user.email}): ${sendMessageDto.content}원`;

        if (socket.rooms.has(userId.toString())) {
          // 브라우저에서 사용자가 여러 개의 탭을 사용하는 경우 전달되는 메시지.
          socket.emit('message', message);
        } else {
          // 다른 사용자에게 전달되는 메시지.
          client.to(socket.id).emit('message', message);
        }
      }

      await this.roomsSerivce.sendMessage(sendMessageDto);
    } catch (error) {
      error.message = '입찰 중 오류 발생.';

      client.emit('error', error);
      client.disconnect(true);
    }
  }
}
