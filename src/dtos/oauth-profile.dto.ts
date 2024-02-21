import { Role } from '../common/enums/common.enum';

export class OAuthProfileDto {
  name: string;

  email: string;

  password: string;

  role: Role;

  oAuthProvider: string;

  oAuthProviderId: string;

  oAuthProviderRefreshToken: string;
}
