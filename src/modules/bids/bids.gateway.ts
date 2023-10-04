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

import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  // UnauthorizedException,
} from '@nestjs/common';
import { RoomsService } from '../rooms/rooms.service';
import { User } from '../../entities/user.entity';
import { SendMessageDto } from '../../dtos/send-message.dto';

@WebSocketGateway({
  cors: {
    origin:
      process.env.NODE_ENV === 'production' ? false : ['http://127.0.0.1:3000'],
    credentials: true,
  },
})
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
    const token = client.handshake.auth.token;

    if (!token) {
      throw new WsException('You must provide a valid token to connect.');
    }

    let itemId: unknown = null;
    itemId = client.handshake.query.id;

    if (!itemId) {
      throw new WsException('No item with this id found.');
    }

    try {
      const payload = await this.authService.verifyToken(token);
      const user = payload && (await this.usersService.findById(payload.id));

      if (!user) {
        throw new WsException('No user with this token found.');
      }

      const room = await this.roomsSerivce.findByItemId(
        itemId as MongooseSchema.Types.ObjectId,
      );

      this.connections.set(client.id, user._id);

      if (room) {
        await this.joinRoom(client, user, room._id);
      } else {
        throw new WsException('No room with this item id found.');
      }
    } catch (error) {
      client.emit('error', { message: error.message });
      this.connections.delete(client.id);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.connections.delete(client.id);
    client.disconnect(true);
  }

  @SubscribeMessage('join')
  async joinRoom(
    client: Socket,
    user: User,
    roomId: MongooseSchema.Types.ObjectId,
  ) {
    try {
      const room = await this.roomsSerivce.findById(roomId);

      if (!room) {
        throw new NotFoundException('No room with this id found.');
      }

      const userId = this.connections.get(client.id);
      const updateUserDto: Partial<User> = {
        room: room,
      };

      await this.usersService.update(userId, updateUserDto);

      await client.join(roomId.toString());
      this.server.emit(
        'join',
        `${user.name}(${user.email})님이 참가하셨습니다.`,
      );
    } catch (error) {
      this.connections.delete(client.id);
      client.disconnect(true);

      if (error instanceof NotFoundException) {
        throw error;
      } else if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Error joining room.');
      }
    }
  }

  @SubscribeMessage('leave')
  async leaveRoom(client: Socket, roomId: MongooseSchema.Types.ObjectId) {
    try {
      const userId = this.connections.get(client.id);
      const updateUserDto: Partial<User> = {
        room: null,
      };

      await this.usersService.update(userId, updateUserDto);

      client.leave(roomId.toString());
    } catch (error) {
      this.connections.delete(client.id);
      client.disconnect(true);

      throw new InternalServerErrorException('Error leaving room.');
    }
  }

  @SubscribeMessage('message')
  async sendMessage(client: Socket, sendMessageDto: SendMessageDto) {
    try {
      const userId = this.connections.get(client.id);
      const user = await this.usersService.findById(userId);
      console.log(sendMessageDto);

      if (!user.room) {
        throw new NotFoundException('No room with this id found.');
      }

      sendMessageDto.userId = userId;
      sendMessageDto.roomId = user.room._id;

      await this.roomsSerivce.addMessage(sendMessageDto);

      // Except the sender
      // with ACK
      client.broadcast.timeout(5000).emit('message', sendMessageDto.content);
    } catch (error) {
      this.connections.delete(client.id);
      client.disconnect(true);

      if (error instanceof NotFoundException) {
        throw error;
      } else {
        console.log(error);
        throw new InternalServerErrorException('Error sending message,');
      }
    }
  }
}
