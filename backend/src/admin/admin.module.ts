import { Module } from '@nestjs/common';
import { StoresModule } from '../stores/stores.module';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [UsersModule, StoresModule],
  controllers: [AdminController],
})
export class AdminModule {}
