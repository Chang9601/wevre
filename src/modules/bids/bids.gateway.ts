import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

@WebSocketGateway()
export class BidsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  connections: Map<string, string> = new Map();

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token.toString();
    const payload = await this.authService.verifyToken(token);

    const user = payload && (await this.usersService.findById(payload.id));
    const room = user.room;

    if (!user) {
      client.disconnect(true);
      return;
    }

    this.connections.set(client.id, user._id);

    if (room) {
    }

    throw new Error('Method not implemented.');
  }

  handleDisconnect(client: any) {
    console.log(client);
    throw new Error('Method not implemented.');
  }
}
