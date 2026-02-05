import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CompositionService } from './composition.service';
import { CreateCompositionDto } from './dto/create-composition.dto';
import { UpdateCompositionDto } from './dto/update-composition.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FileStorageService } from '../file-storage/file-storage.service';
import { User } from '../user/entity/user.entity';

@Controller('composition')
@UseGuards(JwtAuthGuard)
export class CompositionController {
  constructor(
    private readonly compositionService: CompositionService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  @Post()
  create(
    @Body() createCompositionDto: CreateCompositionDto,
    @CurrentUser() user: User,
  ) {
    return this.compositionService.create({
      ...createCompositionDto,
      ownerId: user.id,
    } as any);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAudio(
    @UploadedFile() file: Express.Multer.File,
    @Body() createCompositionDto: CreateCompositionDto,
    @CurrentUser() user: User,
  ) {
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

    const audioPath = await this.fileStorageService.uploadFile(file, 'audio');
    return this.compositionService.create({
      ...createCompositionDto,
      content: audioPath,
      ownerId: user.id,
      size: file.size,
      type: file.mimetype,
    } as any);
  }

  @Get()
  findAll() {
    return this.compositionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.compositionService.findOne(id);
  }

  @Get('my')
  findMyCompositions(@CurrentUser() user: User) {
    return this.compositionService.findByOwnerId(user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCompositionDto: UpdateCompositionDto,
    @CurrentUser() user: User,
  ) {
    return this.compositionService.update(id, updateCompositionDto, user.id);
  }

  @Post(':id/cover')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCover(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      throw new BadRequestException('Only image files are allowed');
    }

    const coverPath = await this.fileStorageService.uploadFile(file, 'audio');
    return this.compositionService.update(
      id,
      { coverImage: coverPath },
      user.id,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.compositionService.remove(id, user.id);
  }
}
