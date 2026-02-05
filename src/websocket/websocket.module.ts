import { Module } from '@nestjs/common';
import { PlaybackGateway } from './playback.gateway';

@Module({
  providers: [PlaybackGateway],
})
export class WebSocketModule {}
