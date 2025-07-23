import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaylistService } from './playlist.service';
import { PlaylistController } from './playlist.controller';
import { Playlist } from './entities/playlist.entity';
import { CompositionModule } from '../composition/composition.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Playlist]), CompositionModule, AuthModule],
  controllers: [PlaylistController],
  providers: [PlaylistService],
  exports: [TypeOrmModule],
})
export class PlaylistModule {}
