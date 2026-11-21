import { IsEmail, IsNotEmpty, Matches } from 'class-validator';
import { PASSWORD_MESSAGE, PASSWORD_REGEX } from '../../common/constants';

export class LoginDto {
  @IsEmail({}, { message: 'Email is not valid' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword: string;

  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  newPassword: string;
}
