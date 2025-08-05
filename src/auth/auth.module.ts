import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
