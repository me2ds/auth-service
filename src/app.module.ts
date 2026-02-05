import { Module } from '@nestjs/common';
import { ConfigAppModule } from './config.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PlaylistModule } from './playlist/playlist.module';
import { CompositionModule } from './composition/composition.module';
import { FileStorageModule } from './file-storage/file-storage.module';
import { RoomsModule } from './rooms/rooms.module';
import { FriendsModule } from './friends/friends.module';
import { MessagesModule } from './messages/messages.module';
import { PlaybackHistoryModule } from './playback-history/playback-history.module';
import { WebSocketModule } from './websocket/websocket.module';
import { SyncModule } from './sync/sync.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigAppModule,
    AuthModule,
    UserModule,
    PlaylistModule,
    CompositionModule,
    FileStorageModule,
    RoomsModule,
    FriendsModule,
    MessagesModule,
    PlaybackHistoryModule,
    WebSocketModule,
    SyncModule,
  ],
})
export class AppModule {}
