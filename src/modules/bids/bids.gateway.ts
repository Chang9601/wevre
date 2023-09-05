import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Schema as MongooseSchema } from 'mongoose';

import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import {
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RoomsService } from '../rooms/rooms.service';
import { User } from '../../entities/user.entity';
import { SendMessageDto } from '../../dtos/send-message.dto';

// Error handling!
@WebSocketGateway()
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
      const token = client.handshake.auth.token.toString();
      // clean code!
      let itemId: unknown;
      itemId = 'dummy';
      itemId = this.extractItemIDFromURL(client.handshake.url);

      if (!token) {
        throw new UnauthorizedException(
          'You must provide a valid token to connect.',
        );
      }

      const payload = await this.authService.verifyToken(token);
      const user = payload && (await this.usersService.findById(payload.id));

      if (!user) {
        throw new NotFoundException('No user with this token found.');
      }

      const room = await this.roomsSerivce.findByItemId(
        itemId as MongooseSchema.Types.ObjectId,
      );

      this.connections.set(client.id, user._id);

      if (room) {
        return await this.joinRoom(client, room._id);
      } else {
        throw new NotFoundException('No room with this item id found.');
      }
    } catch (error) {
      client.disconnect(true);

      if (error instanceof UnauthorizedException) {
        throw error;
      } else if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Error while connecting client to server.',
        );
      }
    }
  }

  handleDisconnect(client: Socket) {
    this.connections.delete(client.id);
    client.disconnect(true);
  }

  @SubscribeMessage('join')
  async joinRoom(client: Socket, roomId: MongooseSchema.Types.ObjectId) {
    try {
      const room = await this.roomsSerivce.findById(roomId);

      if (!room) {
        throw new NotFoundException('No room with this id found.');
      }

      // Here or handleConnection? I guess here
      const userId = this.connections.get(client.id);
      const updateUserDto: Partial<User> = {
        room: room,
      };

      await this.usersService.update(userId, updateUserDto);

      client.join(roomId.toString());
    } catch (error) {
      client.disconnect(true);

      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Error while joining room.');
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
      client.disconnect(true);

      throw new InternalServerErrorException('Error while leaving room.');
    }
  }

  @SubscribeMessage('message')
  async sendMessage(client: Socket, sendMessageDto: SendMessageDto) {
    try {
      const userId = this.connections.get(client.id);
      const user = await this.usersService.findById(userId);

      if (!user.room) {
        throw new NotFoundException('No room with this id found.');
      }

      sendMessageDto.userId = userId;
      sendMessageDto.roomId = user.room._id;

      await this.roomsSerivce.addMessage(sendMessageDto);

      client.to(user.room._id).emit('message', sendMessageDto.content);
    } catch (error) {
      client.disconnect(true);

      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Error while sending message,');
      }
    }
  }

  private extractItemIDFromURL(url: string): string {
    const urlParts = url.split('/');
    const itemID = urlParts[urlParts.length - 1];
    return itemID;
  }
}
