import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3StorageService } from './s3-storage.service';
import { Logger } from '@nestjs/common';

/**
 * Abstract file storage service
 * Can be implemented with different backends (S3, GCS, local, etc.)
 */
@Injectable()
export class FileStorageService {
  private logger = new Logger(FileStorageService.name);

  constructor(
    private configService: ConfigService,
    private s3Storage: S3StorageService,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    folder: 'avatars' | 'banners' | 'audio',
  ): Promise<string> {
    const storageType = this.configService.get<string>('STORAGE_TYPE', 's3');

    if (storageType === 's3') {
      return this.s3Storage.uploadFile(file, folder);
    }

    throw new BadRequestException('Invalid storage type configured');
  }

  async deleteFile(filePath: string): Promise<void> {
    const storageType = this.configService.get<string>('STORAGE_TYPE', 's3');

    if (storageType === 's3') {
      await this.s3Storage.deleteFile(filePath);
      return;
    }

    throw new BadRequestException('Invalid storage type configured');
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const storageType = this.configService.get<string>('STORAGE_TYPE', 's3');

    if (storageType === 's3') {
      return this.s3Storage.getSignedUrl(key, expiresIn);
    }

    throw new BadRequestException('Invalid storage type configured');
  }
}
