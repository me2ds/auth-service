import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { User } from '../user/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [FriendsService],
  controllers: [FriendsController],
  exports: [FriendsService],
})
export class FriendsModule {}
