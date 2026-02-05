import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../user/entity/user.entity';
import { PlaylistService } from '../playlist/playlist.service';
import { CompositionService } from '../composition/composition.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

/**
 * Synchronization Controller
 *
 * Provides REST-based polling endpoints for real-time synchronization.
 * These endpoints are an alternative to WebSocket for Vercel deployments
 * where long-lived connections are not supported.
 *
 * For Kubernetes deployments, use the WebSocket gateway instead.
 * For Vercel deployments, clients should poll these endpoints.
 */
@ApiTags('sync')
@ApiBearerAuth()
@Controller('api/sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  private roomStates = new Map<string, RoomState>();
  private lastSync = new Map<string, number>();

  constructor(
    private playlistService: PlaylistService,
    private compositionService: CompositionService,
  ) {}

  @Get('rooms/:roomId/updates')
  async getRoomUpdates(
    @Param('roomId') roomId: string,
    @Query('since') since?: string,
  ) {
    const sinceTime = since ? parseInt(since) : Date.now() - 5000;
    const state = this.roomStates.get(roomId);

    if (!state) {
      return {
        roomId,
        users: [],
        playbackState: null,
        updates: [],
        timestamp: Date.now(),
      };
    }

    return {
      roomId,
      users: Array.from(state.users.values()),
      playbackState: state.playbackState,
      updates: state.updates.filter((u) => u.timestamp > sinceTime),
      timestamp: Date.now(),
    };
  }

  /**
   * Update playback state (for Vercel)
   */
  @Post('rooms/:roomId/playback')
  async updatePlayback(
    @Param('roomId') roomId: string,
    @Body()
    data: {
      isPlaying: boolean;
      currentPosition: number;
      currentTrackIndex: number;
    },
    @CurrentUser() user: User,
  ) {
    const userId = user.id || user['sub'];

    if (!this.roomStates.has(roomId)) {
      this.roomStates.set(roomId, {
        users: new Map(),
        playbackState: null,
        updates: [],
      });
    }

    const state = this.roomStates.get(roomId)!;
    const playbackState = {
      userId,
      ...data,
      timestamp: Date.now(),
    };

    state.playbackState = playbackState;
    state.updates.push({
      type: 'playback-update',
      data: playbackState,
      timestamp: Date.now(),
    });

    // Keep only last 100 updates
    if (state.updates.length > 100) {
      state.updates.shift();
    }

    return { success: true, playbackState };
  }

  /**
   * Send message to room (for Vercel)
   */
  @Post('rooms/:roomId/messages')
  async sendMessage(
    @Param('roomId') roomId: string,
    @Body() data: { content: string },
    @CurrentUser() user: User,
  ) {
    const userId = user.id || user['sub'];

    if (!this.roomStates.has(roomId)) {
      this.roomStates.set(roomId, {
        users: new Map(),
        playbackState: null,
        updates: [],
      });
    }

    const state = this.roomStates.get(roomId)!;
    const message = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      content: data.content,
      timestamp: Date.now(),
    };

    state.updates.push({
      type: 'message',
      data: message,
      timestamp: Date.now(),
    });

    // Keep only last 100 updates
    if (state.updates.length > 100) {
      state.updates.shift();
    }

    return { success: true, message };
  }

  /**
   * Join room (for Vercel)
   */
  @Post('rooms/:roomId/join')
  async joinRoom(@Param('roomId') roomId: string, @CurrentUser() user: User) {
    const userId = user.id || user['sub'];

    if (!this.roomStates.has(roomId)) {
      this.roomStates.set(roomId, {
        users: new Map(),
        playbackState: null,
        updates: [],
      });
    }

    const state = this.roomStates.get(roomId)!;
    state.users.set(userId, {
      userId,
      joinedAt: Date.now(),
    });

    state.updates.push({
      type: 'user-joined',
      data: { userId, roomId },
      timestamp: Date.now(),
    });

    return {
      success: true,
      roomId,
      usersInRoom: Array.from(state.users.keys()),
    };
  }

  /**
   * Leave room (for Vercel)
   */
  @Post('rooms/:roomId/leave')
  async leaveRoom(@Param('roomId') roomId: string, @CurrentUser() user: User) {
    const userId = user.id || user['sub'];
    const state = this.roomStates.get(roomId);

    if (state) {
      state.users.delete(userId);
      state.updates.push({
        type: 'user-left',
        data: { userId, roomId },
        timestamp: Date.now(),
      });

      if (state.users.size === 0) {
        this.roomStates.delete(roomId);
      }
    }

    return { success: true, roomId };
  }
}

interface RoomState {
  users: Map<string, { userId: string; joinedAt: number }>;
  playbackState: any;
  updates: Array<{ type: string; data: any; timestamp: number }>;
}
