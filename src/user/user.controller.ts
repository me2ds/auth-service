import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserService } from './user.service';
import { FileStorageService } from '../file-storage/file-storage.service';
import { User } from './entity/user.entity';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@CurrentUser() user: User) {
    return this.userService.findOne(user.id);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('search')
  async searchUsers(@Query('q') query: string, @Query('limit') limit = 20) {
    if (!query) {
      return [];
    }
    return this.userService.searchUsers(query, limit);
  }

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: User,
  ) {
    return this.userService.updateProfile(user.id, updateUserDto);
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      throw new BadRequestException('Only image files are allowed');
    }

    const avatarPath = await this.fileStorageService.uploadFile(
      file,
      'avatars',
    );
    return this.userService.updateProfile(user.id, { avatar: avatarPath });
  }

  @Post('banner')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadBanner(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      throw new BadRequestException('Only image files are allowed');
    }

    const bannerPath = await this.fileStorageService.uploadFile(
      file,
      'banners',
    );
    return this.userService.updateProfile(user.id, { banner: bannerPath });
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async deleteProfile(@CurrentUser() user: User) {
    return this.userService.deleteProfile(user.id);
  }
}
