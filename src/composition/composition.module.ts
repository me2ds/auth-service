import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompositionService } from './composition.service';
import { CompositionController } from './composition.controller';
import { Composition } from './entities/composition.entity';
import { AuthModule } from '../auth/auth.module';
import { User } from '../user/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Composition, User]), AuthModule],
  controllers: [CompositionController],
  providers: [CompositionService],
  exports: [TypeOrmModule],
})
export class CompositionModule {}
