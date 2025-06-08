import { Module } from '@nestjs/common';
import { ConfigAppModule } from './config.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
  	ConfigAppModule,
  	AuthModule,
  	ProfileModule,
  	UserModule,
  ],
})
export class AppModule {}
