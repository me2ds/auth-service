import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { Room } from './entities/room.entity';
import { User } from '../user/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room, User])],
  providers: [RoomsService],
  controllers: [RoomsController],
  exports: [RoomsService],
})
export class RoomsModule {}
