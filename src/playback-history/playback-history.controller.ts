import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { PlaybackHistoryService } from './playback-history.service';
import { LogPlaybackDto } from './dto/log-playback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('playback-history')
@UseGuards(JwtAuthGuard)
export class PlaybackHistoryController {
  constructor(
    private readonly playbackHistoryService: PlaybackHistoryService,
  ) {}

  @Post()
  async logPlayback(
    @Body() logPlaybackDto: LogPlaybackDto,
    @CurrentUser() user,
  ) {
    return this.playbackHistoryService.logPlayback(user.id, logPlaybackDto);
  }

  @Get()
  async getHistory(@Query('limit') limit: number = 50, @CurrentUser() user) {
    return this.playbackHistoryService.getUserHistory(user.id, limit);
  }

  @Get('top-played')
  async getTopPlayed(@Query('limit') limit: number = 10, @CurrentUser() user) {
    return this.playbackHistoryService.getTopPlayedCompositions(user.id, limit);
  }
}
