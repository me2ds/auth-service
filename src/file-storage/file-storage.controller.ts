import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileStorageService } from './file-storage.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FileStorageController {
  constructor(private readonly fileStorageService: FileStorageService) {}

  @Post('upload/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      throw new BadRequestException('Only image files are allowed');
    }

    const filePath = await this.fileStorageService.uploadFile(file, 'avatars');
    return { filePath };
  }

  @Post('upload/banner')
  @UseInterceptors(FileInterceptor('file'))
  async uploadBanner(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      throw new BadRequestException('Only image files are allowed');
    }

    const filePath = await this.fileStorageService.uploadFile(file, 'banners');
    return { filePath };
  }

  @Post('upload/audio')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAudio(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (
      !['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'].includes(
        file.mimetype,
      )
    ) {
      throw new BadRequestException('Only audio files are allowed');
    }

    const filePath = await this.fileStorageService.uploadFile(file, 'audio');
    return { filePath };
  }
}
