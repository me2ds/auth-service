import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistService } from './playlist.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Playlist } from './entities/playlist.entity';
import { Composition } from '../composition/entities/composition.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('PlaylistService', () => {
  let service: PlaylistService;
  let mockPlaylistRepository: any;
  let mockCompositionRepository: any;

  beforeEach(async () => {
    mockPlaylistRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    mockCompositionRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlaylistService,
        {
          provide: getRepositoryToken(Playlist),
          useValue: mockPlaylistRepository,
        },
        {
          provide: getRepositoryToken(Composition),
          useValue: mockCompositionRepository,
        },
      ],
    }).compile();

    service = module.get<PlaylistService>(PlaylistService);
  });

  describe('create', () => {
    it('should create and return playlist', async () => {
      const createDto = { name: 'Test Playlist', ownerId: 'user-id' };
      const mockPlaylist = { id: 'playlist-id', ...createDto, compositions: [] };

      mockPlaylistRepository.create.mockReturnValue(mockPlaylist);
      mockPlaylistRepository.save.mockResolvedValue(mockPlaylist);
      mockPlaylistRepository.findOne.mockResolvedValue(mockPlaylist);

      const result = await service.create(createDto);

      expect(result).toEqual(mockPlaylist);
    });
  });

  describe('findAll', () => {
    it('should return all playlists', async () => {
      const mockPlaylists = [{ id: 'playlist-1' }, { id: 'playlist-2' }];
      mockPlaylistRepository.find.mockResolvedValue(mockPlaylists);

      const result = await service.findAll();

      expect(result).toEqual(mockPlaylists);
      expect(mockPlaylistRepository.find).toHaveBeenCalledWith({
        relations: ['compositions'],
      });
    });
  });

  describe('findByOwnerId', () => {
    it('should return playlists by owner id', async () => {
      const mockPlaylists = [{ id: 'playlist-1', ownerId: 'user-id' }];
      mockPlaylistRepository.find.mockResolvedValue(mockPlaylists);

      const result = await service.findByOwnerId('user-id');

      expect(result).toEqual(mockPlaylists);
      expect(mockPlaylistRepository.find).toHaveBeenCalledWith({
        where: { ownerId: 'user-id' },
        relations: ['compositions'],
      });
    });
  });

  describe('findOne', () => {
    it('should return playlist by id', async () => {
      const mockPlaylist = { id: 'playlist-id', name: 'Test Playlist' };
      mockPlaylistRepository.findOne.mockResolvedValue(mockPlaylist);

      const result = await service.findOne('playlist-id');

      expect(result).toEqual(mockPlaylist);
    });

    it('should throw NotFoundException if playlist not found', async () => {
      mockPlaylistRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update playlist if user is owner', async () => {
      const updateDto = { name: 'Updated Playlist' };
      const mockPlaylist = { id: 'playlist-id', ownerId: 'user-id', name: 'Test Playlist' };
      const updatedPlaylist = { ...mockPlaylist, ...updateDto };

      mockPlaylistRepository.findOne.mockResolvedValue(mockPlaylist);
      mockPlaylistRepository.save.mockResolvedValue(updatedPlaylist);

      const result = await service.update('playlist-id', updateDto, 'user-id');

      expect(result).toEqual(updatedPlaylist);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const mockPlaylist = { id: 'playlist-id', ownerId: 'other-user-id' };
      mockPlaylistRepository.findOne.mockResolvedValue(mockPlaylist);

      await expect(service.update('playlist-id', {}, 'user-id')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addCompositionToPlaylist', () => {
    it('should add composition to playlist', async () => {
      const mockPlaylist = { 
        id: 'playlist-id', 
        ownerId: 'user-id', 
        compositions: [] 
      };
      const mockComposition = { id: 'composition-id', name: 'Test Song' };

      mockPlaylistRepository.findOne.mockResolvedValue(mockPlaylist);
      mockCompositionRepository.findOne.mockResolvedValue(mockComposition);
      mockPlaylistRepository.save.mockResolvedValue({
        ...mockPlaylist,
        compositions: [mockComposition]
      });

      const result = await service.addCompositionToPlaylist('playlist-id', 'composition-id', 'user-id');

      expect(result.compositions).toContain(mockComposition);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const mockPlaylist = { id: 'playlist-id', ownerId: 'other-user-id' };
      mockPlaylistRepository.findOne.mockResolvedValue(mockPlaylist);

      await expect(service.addCompositionToPlaylist('playlist-id', 'composition-id', 'user-id'))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if composition not found', async () => {
      const mockPlaylist = { id: 'playlist-id', ownerId: 'user-id' };
      mockPlaylistRepository.findOne.mockResolvedValue(mockPlaylist);
      mockCompositionRepository.findOne.mockResolvedValue(null);

      await expect(service.addCompositionToPlaylist('playlist-id', 'invalid-id', 'user-id'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove playlist if user is owner', async () => {
      const mockPlaylist = { id: 'playlist-id', ownerId: 'user-id' };
      mockPlaylistRepository.findOne.mockResolvedValue(mockPlaylist);

      await service.remove('playlist-id', 'user-id');

      expect(mockPlaylistRepository.remove).toHaveBeenCalledWith(mockPlaylist);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const mockPlaylist = { id: 'playlist-id', ownerId: 'other-user-id' };
      mockPlaylistRepository.findOne.mockResolvedValue(mockPlaylist);

      await expect(service.remove('playlist-id', 'user-id')).rejects.toThrow(ForbiddenException);
    });
  });
});