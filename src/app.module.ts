import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigAppModule } from './config.module';
import { ProfileModule } from './profile/profile.module';
import { PlaylistsModule } from './playlists/playlists.module';

@Module({
  imports: [
  	AuthModule,
  	ConfigAppModule,
  	ProfileModule,
  	PlaylistsModule
  ],
})
export class AppModule {}
