import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface UserSocket {
  userId: string;
  roomId?: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class PlaybackGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private userSockets = new Map<string, UserSocket>();
  private roomUsers = new Map<string, Set<string>>();

  constructor(private readonly jwtService: JwtService) {}

  afterInit(server: Server) {
    console.log('WebSocket initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub || payload.id;

      this.userSockets.set(client.id, { userId });
      console.log(`User ${userId} connected with socket ${client.id}`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userSocket = this.userSockets.get(client.id);
    if (userSocket) {
      const roomId = userSocket.roomId;
      if (roomId) {
        const roomUsers = this.roomUsers.get(roomId);
        if (roomUsers) {
          roomUsers.delete(userSocket.userId);
          if (roomUsers.size === 0) {
            this.roomUsers.delete(roomId);
          } else {
            this.server.to(roomId).emit('user-left', {
              userId: userSocket.userId,
              roomId,
            });
          }
        }
      }
      this.userSockets.delete(client.id);
      console.log(`User ${userSocket.userId} disconnected`);
    }
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userSocket = this.userSockets.get(client.id);
    if (!userSocket) {
      return;
    }

    // Leave previous room
    if (userSocket.roomId) {
      const previousRoomUsers = this.roomUsers.get(userSocket.roomId);
      if (previousRoomUsers) {
        previousRoomUsers.delete(userSocket.userId);
      }
      client.leave(userSocket.roomId);
    }

    // Join new room
    userSocket.roomId = data.roomId;
    if (!this.roomUsers.has(data.roomId)) {
      this.roomUsers.set(data.roomId, new Set());
    }
    this.roomUsers.get(data.roomId)!.add(userSocket.userId);

    client.join(data.roomId);

    // Notify others
    this.server.to(data.roomId).emit('user-joined', {
      userId: userSocket.userId,
      roomId: data.roomId,
    });

    return {
      success: true,
      roomId: data.roomId,
      usersInRoom: Array.from(this.roomUsers.get(data.roomId) || []),
    };
  }

  @SubscribeMessage('playback-update')
  handlePlaybackUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string;
      isPlaying: boolean;
      currentPosition: number;
      currentTrackIndex: number;
    },
  ) {
    const userSocket = this.userSockets.get(client.id);
    if (!userSocket || userSocket.roomId !== data.roomId) {
      return;
    }

    this.server.to(data.roomId).emit('playback-update', {
      userId: userSocket.userId,
      isPlaying: data.isPlaying,
      currentPosition: data.currentPosition,
      currentTrackIndex: data.currentTrackIndex,
      timestamp: Date.now(),
    });
  }

  @SubscribeMessage('send-message')
  handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string;
      content: string;
      senderId: string;
    },
  ) {
    const userSocket = this.userSockets.get(client.id);
    if (!userSocket || userSocket.roomId !== data.roomId) {
      return;
    }

    this.server.to(data.roomId).emit('message', {
      ...data,
      timestamp: Date.now(),
    });
  }

  @SubscribeMessage('playlist-change')
  handlePlaylistChange(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string;
      playlistId: string;
    },
  ) {
    const userSocket = this.userSockets.get(client.id);
    if (!userSocket || userSocket.roomId !== data.roomId) {
      return;
    }

    this.server.to(data.roomId).emit('playlist-changed', {
      playlistId: data.playlistId,
      changedBy: userSocket.userId,
    });
  }

  @SubscribeMessage('user-activity')
  handleUserActivity(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string;
      action: string;
    },
  ) {
    const userSocket = this.userSockets.get(client.id);
    if (!userSocket || userSocket.roomId !== data.roomId) {
      return;
    }

    this.server.to(data.roomId).emit('user-activity', {
      userId: userSocket.userId,
      action: data.action,
      timestamp: Date.now(),
    });
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userSocket = this.userSockets.get(client.id);
    if (!userSocket) {
      return;
    }

    const roomUsers = this.roomUsers.get(data.roomId);
    if (roomUsers) {
      roomUsers.delete(userSocket.userId);
    }

    client.leave(data.roomId);
    userSocket.roomId = undefined;

    this.server.to(data.roomId).emit('user-left', {
      userId: userSocket.userId,
      roomId: data.roomId,
    });
  }
}
