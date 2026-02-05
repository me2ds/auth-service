import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlaybackHistory } from './entities/playback-history.entity';
import { LogPlaybackDto } from './dto/log-playback.dto';

@Injectable()
export class PlaybackHistoryService {
  constructor(
    @InjectRepository(PlaybackHistory)
    private readonly playbackHistoryRepository: Repository<PlaybackHistory>,
  ) {}

  async logPlayback(
    userId: string,
    logPlaybackDto: LogPlaybackDto,
  ): Promise<PlaybackHistory> {
    const existing = await this.playbackHistoryRepository.findOne({
      where: {
        userId,
        compositionId: logPlaybackDto.compositionId,
      },
    });

    if (existing) {
      existing.playCount += 1;
      if (logPlaybackDto.playedDuration) {
        existing.playedDuration = logPlaybackDto.playedDuration;
      }
      existing.playedAt = new Date();
      return this.playbackHistoryRepository.save(existing);
    }

    const history = this.playbackHistoryRepository.create({
      userId,
      compositionId: logPlaybackDto.compositionId,
      playedDuration: logPlaybackDto.playedDuration || 0,
      playCount: 1,
    });

    return this.playbackHistoryRepository.save(history);
  }

  async getUserHistory(
    userId: string,
    limit: number = 50,
  ): Promise<PlaybackHistory[]> {
    return this.playbackHistoryRepository.find({
      where: { userId },
      relations: ['composition', 'composition.owner'],
      order: { playedAt: 'DESC' },
      take: limit,
    });
  }

  async getTopPlayedCompositions(
    userId: string,
    limit: number = 10,
  ): Promise<PlaybackHistory[]> {
    return this.playbackHistoryRepository.find({
      where: { userId },
      relations: ['composition', 'composition.owner'],
      order: { playCount: 'DESC' },
      take: limit,
    });
  }
}
