import { Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Put, Query, UseGuards } from '@nestjs/common';
import { AuthUser, CurrentUser } from '../common/current-user.decorator';
import { ListQueryDto } from '../common/list-query.dto';
import { Role } from '../common/role.enum';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RateStoreDto } from './dto/store.dto';
import { StoresService } from './stores.service';

@Controller('stores')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StoresController {
  constructor(private service: StoresService) {}

  @Get()
  @Roles(Role.USER)
  list(@Query() query: ListQueryDto, @CurrentUser() user: AuthUser) {
    return this.service.list(query, user.id);
  }

  @Put(':id/rating')
  @Roles(Role.USER)
  rate(@Param('id', ParseIntPipe) id: number, @Body() dto: RateStoreDto, @CurrentUser() user: AuthUser) {
    return this.service.rate(user.id, id, dto.value);
  }

  @Get('owner/dashboard')
  @Roles(Role.OWNER)
  async ownerDashboard(@CurrentUser() user: AuthUser) {
    const stats = await this.service.ownerStats(user.id);
    if (!stats) throw new NotFoundException('No store is assigned to this owner yet');
    return stats;
  }
}
