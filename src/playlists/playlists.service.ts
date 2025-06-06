import { Injectable } from '@nestjs/common';

var playlists = [
				{
					id: "123",
					name: "Playlist1", 
					ownerId: "me"
				},
				{
					id: "124",
					name: "Playlist1", 
					ownerId: "me"
				},
				{
					id: "125",
					name: "Playlist1", 
					ownerId: "me"
				},
				{
					id: "126",
					name: "Playlist1", 
					ownerId: "me"
				}
			]

@Injectable()
export class PlaylistsService {
	
	async getAll() {
		return {playlists}
	}
	async createNew(name: string) {
		const playlist = {
			id: new Date().toString(),
			name: name,
			ownerId: "me"
		}
		playlists.push(playlist)
		return {playlist}
	}
	async deletePlaylist(playlistId: string) {
		playlists = playlists.filter((playlist) => playlist.id !== playlistId)
		return { playlists }
	}
}
