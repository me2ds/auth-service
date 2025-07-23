import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Playlist } from './entities/playlist.entity';
import { Composition } from '../composition/entities/composition.entity';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';

@Injectable()
export class PlaylistService {
  constructor(
    @InjectRepository(Playlist)
    private readonly playlistRepository: Repository<Playlist>,
    @InjectRepository(Composition)
    private readonly compositionRepository: Repository<Composition>,
  ) {}

  async create(createPlaylistDto: CreatePlaylistDto): Promise<Playlist> {
    const playlist = this.playlistRepository.create(createPlaylistDto);
    const savedPlaylist = await this.playlistRepository.save(playlist);
    return savedPlaylist;
  }

  async findAll(): Promise<Playlist[]> {
    return await this.playlistRepository.find({
      relations: ['owner', 'compositions'],
    });
  }

  async findByOwnerId(ownerId: string): Promise<Playlist[]> {
    return await this.playlistRepository.find({
      where: { ownerId },
      relations: ['owner', 'compositions'],
    });
  }

  async findOne(id: string): Promise<Playlist> {
    const playlist = await this.playlistRepository.findOne({
      where: { id },
      relations: ['owner', 'compositions'],
    });

    if (!playlist) {
      throw new NotFoundException(`Playlist with ID ${id} not found`);
    }

    return playlist;
  }

  async update(
    id: string,
    updatePlaylistDto: UpdatePlaylistDto,
    userId: string,
  ): Promise<Playlist> {
    const playlist = await this.findOne(id);
    
    if (playlist.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to update this playlist');
    }
    
    Object.assign(playlist, updatePlaylistDto);
    return await this.playlistRepository.save(playlist);
  }

  async addCompositionToPlaylist(
    playlistId: string,
    compositionId: string,
    userId: string,
  ): Promise<Playlist> {
    const playlist = await this.findOne(playlistId);
    
    if (playlist.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to modify this playlist');
    }
    
    const composition = await this.compositionRepository.findOne({
      where: { id: compositionId },
    });

    if (!composition) {
      throw new NotFoundException(
        `Composition with ID ${compositionId} not found`,
      );
    }

    const hasComposition = playlist.compositions.some(
      (comp) => comp.id === compositionId,
    );

    if (!hasComposition) {
      playlist.compositions.push(composition);
      return await this.playlistRepository.save(playlist);
    }

    return playlist;
  }

  async removeCompositionFromPlaylist(
    playlistId: string,
    compositionId: string,
    userId: string,
  ): Promise<Playlist> {
    const playlist = await this.findOne(playlistId);
    
    if (playlist.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to modify this playlist');
    }

    playlist.compositions = playlist.compositions.filter(
      (comp) => comp.id !== compositionId,
    );

    return await this.playlistRepository.save(playlist);
  }

  async remove(id: string, userId: string): Promise<void> {
    const playlist = await this.findOne(id);
    
    if (playlist.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this playlist');
    }
    
    await this.playlistRepository.remove(playlist);
  }
}
