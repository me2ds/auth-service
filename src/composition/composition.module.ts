import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompositionService } from './composition.service';
import { CompositionController } from './composition.controller';
import { Composition } from './entities/composition.entity';
import { AuthModule } from '../auth/auth.module';
import { FileStorageModule } from '../file-storage/file-storage.module';
import { User } from '../user/entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Composition, User]),
    AuthModule,
    FileStorageModule,
  ],
  controllers: [CompositionController],
  providers: [CompositionService],
  exports: [TypeOrmModule],
})
export class CompositionModule {}
