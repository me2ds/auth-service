import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaybackHistoryService } from './playback-history.service';
import { PlaybackHistoryController } from './playback-history.controller';
import { PlaybackHistory } from './entities/playback-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlaybackHistory])],
  providers: [PlaybackHistoryService],
  controllers: [PlaybackHistoryController],
  exports: [PlaybackHistoryService],
})
export class PlaybackHistoryModule {}
