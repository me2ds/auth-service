import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let mockUserRepository: any;

  beforeEach(async () => {
    mockUserRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return user', async () => {
      const createUserDto = { authIds: ['auth-123'], username: 'testuser', avatar: 'avatar-url' };
      const mockUser = {
        id: 'user-id',
        authIds: ['auth-123'],
        username: 'testuser',
        avatar: 'avatar-url',
        banner: null,
        playlists: [],
        compositions: []
      };

      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          authIds: ['auth-1'],
          username: 'user1',
          avatar: null,
          banner: null,
          playlists: [],
          compositions: []
        },
        {
          id: 'user-2',
          authIds: ['auth-2'],
          username: 'user2',
          avatar: null,
          banner: null,
          playlists: [],
          compositions: []
        }
      ];
      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      const mockUser = {
        id: 'user-id',
        authIds: ['auth-123'],
        username: 'testuser',
        avatar: null,
        banner: null,
        playlists: [],
        compositions: []
      };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('user-id');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-id' } });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 'invalid-id' } });
    });
  });

  describe('updateProfile', () => {
    it('should update and return user profile', async () => {
      const updateDto = { authIds: ['auth-456'], username: 'updated-user' };
      const mockUser = {
        id: 'user-id',
        authIds: ['auth-123'],
        username: 'testuser',
        avatar: null,
        banner: null,
        playlists: [],
        compositions: []
      };
      const updatedUser = {
        id: 'user-id',
        authIds: ['auth-456'],
        username: 'updated-user',
        avatar: null,
        banner: null,
        playlists: [],
        compositions: []
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('user-id', updateDto);

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-id' } });
      expect(mockUserRepository.save).toHaveBeenCalledWith(updatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.updateProfile('invalid-id', {} as any)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 'invalid-id' } });
    });
  });

  describe('deleteProfile', () => {
    it('should delete user profile', async () => {
      const mockUser = {
        id: 'user-id',
        authIds: ['auth-123'],
        username: 'testuser',
        avatar: null,
        banner: null,
        playlists: [],
        compositions: []
      };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await service.deleteProfile('user-id');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-id' } });
      expect(mockUserRepository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteProfile('invalid-id')).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 'invalid-id' } });
    });
  });
});