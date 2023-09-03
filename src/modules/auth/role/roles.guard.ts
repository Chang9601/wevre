import { CanActivate, ExecutionContext, mixin } from '@nestjs/common';
import { Observable } from 'rxjs';

import Role from './role.enum';
import RequestWithUser from '../interfaces/request-with-user.interface';

const RolesGuard = (role: Role) => {
  class RolesGuardMixin implements CanActivate {
    canActivate(
      context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
      const req = context.switchToHttp().getRequest<RequestWithUser>();
      const user = req.user;

      return user?.roles.includes(role);
    }
  }

  return mixin(RolesGuardMixin);
};

export default RolesGuard;
