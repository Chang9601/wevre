import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { parse } from 'cookie';
import { WsException } from '@nestjs/websockets';

import { AuthService } from '../../auth/auth.service';
import { UsersService } from '../../users/users.service';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const cookie = context.getArgByIndex(0).handshake.headers.cookie;

    try {
      const { access_token: accessToken } = parse(cookie);

      const payload = await this.authService.verifyToken(accessToken);
      const user = await this.usersService.findById(payload.id);

      return !!user;
    } catch (error) {
      throw new WsException('Unauthorized');
    }
  }
}
