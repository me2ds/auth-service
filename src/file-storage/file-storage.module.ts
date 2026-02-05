import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileStorageService } from './file-storage.service';
import { S3StorageService } from './s3-storage.service';
import { FileStorageController } from './file-storage.controller';

@Module({
  imports: [ConfigModule],
  providers: [FileStorageService, S3StorageService],
  controllers: [FileStorageController],
  exports: [FileStorageService],
})
export class FileStorageModule {}
