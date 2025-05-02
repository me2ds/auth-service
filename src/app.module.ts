import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigAppModule } from './config.module';
import { ConvertModule } from './convert/convert.module';

@Module({
  imports: [
  	AuthModule,
  	ConfigAppModule,
  	ConvertModule,
  ],
})
export class AppModule {}
