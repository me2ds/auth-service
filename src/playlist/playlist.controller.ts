import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('playlist')
@UseGuards(JwtAuthGuard)
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Post()
  create(
    @Body() createPlaylistDto: CreatePlaylistDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.playlistService.create({
      ...createPlaylistDto,
      ownerId: user.id,
    } as any);
  }

  @Get()
  findAll() {
    return this.playlistService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playlistService.findOne(id);
  }

  @Get('my')
  findMyPlaylists(@CurrentUser() user: JwtPayload) {
    return this.playlistService.findByOwnerId(user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePlaylistDto: UpdatePlaylistDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.playlistService.update(id, updatePlaylistDto, user.id);
  }

  @Post(':id/composition/:compositionId')
  addCompositionToPlaylist(
    @Param('id') id: string,
    @Param('compositionId') compositionId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.playlistService.addCompositionToPlaylist(id, compositionId, user.id);
  }

  @Delete(':id/composition/:compositionId')
  removeCompositionFromPlaylist(
    @Param('id') id: string,
    @Param('compositionId') compositionId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.playlistService.removeCompositionFromPlaylist(
      id,
      compositionId,
      user.id,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.playlistService.remove(id, user.id);
  }
}
