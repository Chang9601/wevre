import { Matches } from 'class-validator';
import { REGEX_VALIDATOR } from '../utils/regex-validator';

export class SigninDto {
  @Matches(REGEX_VALIDATOR.EMAIL, {
    message:
      'The provided email address does not adhere to the required format (e.g., example@example.com) for a valid email address.',
  })
  email: string;

  @Matches(REGEX_VALIDATOR.PASSWORD, {
    message:
      'The password must be 8 to 15 characters long and include at least one lowercase letter, one uppercase letter, one digit, and one special character (!@#$%^&*).',
  })
  password: string;
}
