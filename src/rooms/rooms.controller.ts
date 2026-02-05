import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  async create(@Body() createRoomDto: CreateRoomDto, @CurrentUser() user) {
    return this.roomsService.create(createRoomDto, user.id);
  }

  @Get()
  async findAll(@CurrentUser() user) {
    return this.roomsService.findAll(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
    @CurrentUser() user,
  ) {
    return this.roomsService.update(id, updateRoomDto, user.id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user) {
    await this.roomsService.delete(id, user.id);
    return { message: 'Room deleted successfully' };
  }

  @Post(':id/members/:memberId')
  async addMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user,
  ) {
    return this.roomsService.addMember(id, user.id, memberId);
  }

  @Delete(':id/members/:memberId')
  async removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user,
  ) {
    return this.roomsService.removeMember(id, user.id, memberId);
  }

  @Get(':id/members')
  async getMembers(@Param('id') id: string) {
    return this.roomsService.getRoomMembers(id);
  }

  @Patch(':id/playback')
  async updatePlayback(
    @Param('id') id: string,
    @Body()
    playbackData: {
      isPlaying?: boolean;
      currentPosition?: number;
      currentTrackIndex?: number;
    },
    @CurrentUser() user,
  ) {
    return this.roomsService.updatePlayback(id, user.id, playbackData);
  }
}
