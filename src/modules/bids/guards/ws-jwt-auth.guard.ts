import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { parse } from 'cookie';
import { WsException } from '@nestjs/websockets';

import { AuthService } from '../../auth/auth.service';
import { UsersService } from '../../users/users.service';
import { buildFilter } from '../../../common/factories/common.factory';

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

      const payload = await this.authService.validateToken(accessToken);
      const filter = buildFilter('_id', payload.id);
      const user = await this.usersService.findOne(filter);

      return !!user;
    } catch (error) {
      throw new WsException('권한 없음.');
    }
  }
}
