import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../src/user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/user/entity/user.entity';
import { Repository } from 'typeorm';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto = {
        username: 'testuser',
        authIds: ['github_123'],
        avatar: null,
      };

      const user = { id: '1', ...createUserDto };

      jest.spyOn(userRepository, 'create').mockReturnValue(user as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue(user as any);

      const result = await service.create(createUserDto);

      expect(result).toEqual(user);
      expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(userRepository.save).toHaveBeenCalledWith(user);
    });
  });

  describe('findOne', () => {
    it('should find a user by id', async () => {
      const user = {
        id: '1',
        username: 'testuser',
        authIds: ['github_123'],
        avatar: null,
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);

      const result = await service.findOne('1');

      expect(result).toEqual(user);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: expect.any(Array),
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(
        'User with ID 1 not found',
      );
    });
  });

  describe('searchUsers', () => {
    it('should search users by username', async () => {
      const users = [
        { id: '1', username: 'john_doe', authIds: [], avatar: null },
        { id: '2', username: 'john_smith', authIds: [], avatar: null },
      ];

      jest.spyOn(userRepository, 'find').mockResolvedValue(users as any);

      const result = await service.searchUsers('john', 20);

      expect(result).toEqual(users);
      expect(userRepository.find).toHaveBeenCalled();
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const existingUser = {
        id: '1',
        username: 'testuser',
        authIds: ['github_123'],
        avatar: null,
      };

      const updateUserDto = {
        username: 'updateduser',
        bio: 'My bio',
      };

      const updatedUser = { ...existingUser, ...updateUserDto };

      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(existingUser as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue(updatedUser as any);

      const result = await service.updateProfile('1', updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(userRepository.save).toHaveBeenCalled();
    });
  });

  describe('deleteProfile', () => {
    it('should delete a user', async () => {
      const user = {
        id: '1',
        username: 'testuser',
        authIds: ['github_123'],
        avatar: null,
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);
      jest.spyOn(userRepository, 'remove').mockResolvedValue(null);

      await service.deleteProfile('1');

      expect(userRepository.remove).toHaveBeenCalledWith(user);
    });
  });
});
