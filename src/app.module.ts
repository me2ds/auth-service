import { Module } from '@nestjs/common';
import { ConfigAppModule } from './config.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
  	ConfigAppModule,
  	AuthModule,
  	UserModule,
  ],
})
export class AppModule {}
