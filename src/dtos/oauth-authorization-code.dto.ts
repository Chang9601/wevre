import { IsString } from 'class-validator';

import { ValidationError } from '../common/enums/common.enum';

export class OAuthAuthorizationCodeDto {
  @IsString({ message: ValidationError.STRING_TYPE })
  code: string;

  @IsString({ message: ValidationError.STRING_TYPE })
  error: string;

  @IsString({ message: ValidationError.STRING_TYPE })
  state?: string;
}
