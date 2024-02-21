import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { User } from '../../../entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../../../common/enums/common.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as User;

    const authorized =
      user && user.roles && roles.some((role) => user.roles?.includes(role));

    if (authorized) {
      return true;
    }

    throw new ForbiddenException('역할 없음.');
  }
}
