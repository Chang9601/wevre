import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  //OnGatewayInit,
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
import { User } from '../../entities/user.entity';
import { SendMessageDto } from '../../dtos/send-message.dto';
import { WebsocketExceptionFilter } from '../../filter/ws-exception.filter';
import { WsJwtAuthGuard } from './guards/ws-jwt-auth.guard';

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

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly roomsSerivce: RoomsService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const cookie = client.handshake.headers.cookie;
      const { session_id: sessionId } = parse(cookie);

      let itemId: unknown = null;
      itemId = client.handshake.query.id;

      if (!itemId) {
        throw new WsException('No item with this id found.');
      }

      const room = await this.roomsSerivce.findByItemId(
        itemId as MongooseSchema.Types.ObjectId,
      );

      if (!room) {
        throw new WsException('No room with this item id found.');
      }

      // already in the room
      if (sessionId) {
        return;
      }

      await this.joinRoom(client, room._id);
    } catch (error) {
      client.send(error.message);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    client.disconnect(true);
  }

  @SubscribeMessage('join')
  async joinRoom(client: Socket, roomId: MongooseSchema.Types.ObjectId) {
    try {
      const cookie = client.handshake.headers.cookie;
      const { access_token: accessToken } = parse(cookie);

      const payload = await this.authService.verifyToken(accessToken);
      const user = payload && (await this.usersService.findById(payload.id));

      const room = await this.roomsSerivce.findById(roomId);
      const updateUserDto: Partial<User> = {
        room: room,
      };

      await this.usersService.update(user._id, updateUserDto);
      await client.join(roomId.toString());
      this.server.emit(
        'join',
        `${user.name}(${user.email})님이 참가하셨습니다.`,
      );
    } catch (error) {
      client.disconnect(true);

      throw new WsException('Error joining room.');
    }
  }

  @SubscribeMessage('leave')
  async leaveRoom(client: Socket, roomId: MongooseSchema.Types.ObjectId) {
    try {
      const cookie = client.handshake.headers.cookie;
      const { access_token: accessToken } = parse(cookie);

      const payload = await this.authService.verifyToken(accessToken);
      const user = payload && (await this.usersService.findById(payload.id));

      const updateUserDto: Partial<User> = {
        room: null,
      };

      await this.usersService.update(user._id, updateUserDto);

      client.leave(roomId.toString());
    } catch (error) {
      client.disconnect(true);

      throw new WsException('Error leaving room.');
    }
  }

  @SubscribeMessage('message')
  async sendMessage(client: Socket, sendMessageDto: SendMessageDto) {
    try {
      const cookie = client.handshake.headers.cookie;
      const { access_token: accessToken } = parse(cookie);

      const payload = await this.authService.verifyToken(accessToken);
      const user = payload && (await this.usersService.findById(payload.id));

      sendMessageDto.userId = user._id;
      sendMessageDto.roomId = user.room._id;
      sendMessageDto.content = `${user.name}(${user.email}): ${sendMessageDto.content}`;

      await this.roomsSerivce.addMessage(sendMessageDto);

      client.broadcast.emit('message', sendMessageDto.content);
    } catch (error) {
      client.disconnect(true);

      throw new WsException('Error sending message,');
    }
  }
}
