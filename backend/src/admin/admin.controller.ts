import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ListQueryDto } from '../common/list-query.dto';
import { Role } from '../common/role.enum';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { CreateStoreDto } from '../stores/dto/store.dto';
import { StoresService } from '../stores/stores.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private users: UsersService, private stores: StoresService) {}

  @Get('dashboard')
  async dashboard() {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      this.users.count(),
      this.stores.countStores(),
      this.stores.countRatings(),
    ]);
    return { totalUsers, totalStores, totalRatings };
  }

  @Post('users')
  createUser(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  @Get('users')
  listUsers(@Query() query: ListQueryDto) {
    return this.users.list(query);
  }

  @Get('users/:id')
  async userDetails(@Param('id', ParseIntPipe) id: number) {
    const user = await this.users.findById(id);
    if (user.role === Role.OWNER) {
      const stats = await this.stores.ownerStats(id);
      return { ...user, rating: stats ? stats.averageRating : null };
    }
    return user;
  }

  @Post('stores')
  createStore(@Body() dto: CreateStoreDto) {
    return this.stores.create(dto);
  }

  @Get('stores')
  listStores(@Query() query: ListQueryDto) {
    return this.stores.list(query);
  }
}
