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
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? false
        : ['http://127.0.0.1:3000', 'http://localhost:3000'],
    credentials: true,
  },
})
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
        this.connections.set(sessionId, user._id);
        console.log(this.connections);
      }

      if (!itemId) {
        throw new WsException('No item with this id found.');
      }

      if (!roomId) {
        throw new WsException('No room with this id found.');
      }

      await this.joinRoom(client, {
        roomId: roomId as MongooseSchema.Types.ObjectId,
      });
    } catch (error) {
      client.send(error.message);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const { sessionId } = client.handshake.auth;

    this.connections.delete(sessionId);
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
      client.disconnect(true);

      throw new WsException('Error joining a room.');
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
      client.disconnect(true);

      throw new WsException('Error leaving a room.');
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
      const sockets = await this.server
        .in(sendMessageDto.roomId.toString())
        .fetchSockets();

      for (const socket of sockets) {
        const otherCookie = socket.handshake.headers.cookie;
        const { session_id: otherSessionId } = parse(otherCookie);

        if (sessionId === otherSessionId) {
          message = `본인: ${sendMessageDto.content}`;
        } else {
          message = `${user.name}(${user.email}): ${sendMessageDto.content}`;
        }

        client.to(socket.id).emit('message', message);
      }

      await this.roomsSerivce.addMessage(sendMessageDto);
    } catch (error) {
      client.disconnect(true);

      throw new WsException('Error sending a message.');
    }
  }
}
