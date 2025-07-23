import { Module } from '@nestjs/common';
import { ConfigAppModule } from './config.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PlaylistModule } from './playlist/playlist.module';
import { CompositionModule } from './composition/composition.module';

@Module({
  imports: [
  	ConfigAppModule,
  	AuthModule,
  	UserModule,
  	PlaylistModule,
  	CompositionModule,
  ],
})
export class AppModule {}
