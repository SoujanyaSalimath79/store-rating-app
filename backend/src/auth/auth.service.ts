import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/role.enum';
import { SignupDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { ChangePasswordDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}

  async signup(dto: SignupDto) {
    await this.users.create({ ...dto, role: Role.USER }); // public signup is always a normal user
    return { message: 'Account created. You can now log in.' };
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmailWithPassword(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const accessToken = await this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role });
    return { accessToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.users.findByIdWithPassword(userId);
    if (!user || !(await bcrypt.compare(dto.currentPassword, user.password))) {
      throw new BadRequestException('Current password is incorrect');
    }
    await this.users.updatePassword(userId, dto.newPassword);
    return { message: 'Password updated' };
  }
}
