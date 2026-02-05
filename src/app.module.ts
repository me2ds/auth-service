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
import { SyncModule } from './sync/sync.module';

@Module({
  imports: [
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
    SyncModule,
  ],
})
export class AppModule {}
