import { IsEmail, IsEnum, IsNotEmpty, Length, Matches, MaxLength } from 'class-validator';
import { PASSWORD_MESSAGE, PASSWORD_REGEX } from '../../common/constants';
import { Role } from '../../common/role.enum';

export class SignupDto {
  @Length(20, 60, { message: 'Name must be between 20 and 60 characters' })
  name: string;

  @IsEmail({}, { message: 'Email is not valid' })
  email: string;

  @IsNotEmpty({ message: 'Address is required' })
  @MaxLength(400, { message: 'Address can be at most 400 characters' })
  address: string;

  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password: string;
}

export class CreateUserDto extends SignupDto {
  @IsEnum(Role, { message: 'Role must be ADMIN, USER or OWNER' })
  role: Role;
}
