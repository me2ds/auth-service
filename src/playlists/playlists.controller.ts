import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}
  @Get()
  async getAll() {
  	return this.playlistsService.getAll()
  }
  @Post()
	async createNewPlaylist(@Body() { name }) {
  	return this.playlistsService.createNew(name)
  }
  @Delete(":playlistId")
  async deletePlaylist(@Param("playlistId") playlistId: string) {
  	return this.playlistsService.deletePlaylist(playlistId)
  }
}
