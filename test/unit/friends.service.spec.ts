import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FriendsService } from '../src/friends/friends.service';
import { User } from '../src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('FriendsService', () => {
  let service: FriendsService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendsService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FriendsService>(FriendsService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('addFriend', () => {
    it('should add a friend', async () => {
      const user = {
        id: '1',
        username: 'user1',
        friends: [],
      };

      const friend = {
        id: '2',
        username: 'user2',
      };

      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce(user as any)
        .mockResolvedValueOnce(friend as any);
      jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue({ ...user, friends: [friend] } as any);

      const result = await service.addFriend('1', '2');

      expect(result.friends).toContain(friend);
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          friends: expect.arrayContaining([friend]),
        }),
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.addFriend('1', '2')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getFriends', () => {
    it('should return user friends', async () => {
      const user = {
        id: '1',
        username: 'user1',
        friends: [
          { id: '2', username: 'user2' },
          { id: '3', username: 'user3' },
        ],
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);

      const result = await service.getFriends('1');

      expect(result).toEqual(user.friends);
    });
  });

  describe('checkFriendship', () => {
    it('should return true if users are friends', async () => {
      const user = {
        id: '1',
        username: 'user1',
        friends: [{ id: '2', username: 'user2' }],
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);

      const result = await service.checkFriendship('1', '2');

      expect(result).toBe(true);
    });

    it('should return false if users are not friends', async () => {
      const user = {
        id: '1',
        username: 'user1',
        friends: [],
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);

      const result = await service.checkFriendship('1', '2');

      expect(result).toBe(false);
    });
  });

  describe('removeFriend', () => {
    it('should remove a friend', async () => {
      const user = {
        id: '1',
        username: 'user1',
        friends: [
          { id: '2', username: 'user2' },
          { id: '3', username: 'user3' },
        ],
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue({
        ...user,
        friends: [{ id: '3', username: 'user3' }],
      } as any);

      const result = await service.removeFriend('1', '2');

      expect(result.friends).toHaveLength(1);
      expect(result.friends[0].id).toBe('3');
    });
  });
});
