import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class BidsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const token = client.handshake.query;
    console.log(token);

    throw new Error('Method not implemented.');
  }

  handleDisconnect(client: any) {
    console.log(client);
    throw new Error('Method not implemented.');
  }
}
