import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.userService.findOne(user.id);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
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
    @CurrentUser() user: JwtPayload,
  ) {
    return this.userService.updateProfile(user.id, updateUserDto);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async deleteProfile(@CurrentUser() user: JwtPayload) {
    return this.userService.deleteProfile(user.id);
  }
}
