import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { PlaylistModule } from '../playlist/playlist.module';
import { CompositionModule } from '../composition/composition.module';

/**
 * Synchronization Module
 *
 * Provides REST-based polling endpoints for real-time synchronization.
 * Use this on Vercel where WebSocket is not supported.
 * Use WebSocket gateway on Kubernetes deployments.
 */
@Module({
  imports: [PlaylistModule, CompositionModule],
  controllers: [SyncController],
  exports: [],
})
export class SyncModule {}
