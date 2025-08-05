import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entity/user.entity';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository: any;
  let mockConfigService: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockUserRepository = {
      createQueryBuilder: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('github', () => {
    it('should create new user and return auth token', async () => {
      const mockProfile = { id: 123, login: 'testuser', avatar_url: 'avatar.jpg' };
      const mockUser = { id: 'user-id', authIds: [123], username: 'testuser', avatar: 'avatar.jpg' };
      
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ access_token: 'github-token' }),
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve(mockProfile),
        });

      mockConfigService.get.mockReturnValue('test-value');
      mockUserRepository.getOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.github('test-code');

      expect(result).toEqual({ authToken: 'jwt-token' });
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        authIds: [123],
        username: 'testuser',
        avatar: 'avatar.jpg',
      });
    });

    it('should return auth token for existing user', async () => {
      const mockProfile = { id: 123, login: 'testuser', avatar_url: 'avatar.jpg' };
      const mockUser = { id: 'user-id', authIds: [123] };
      
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ access_token: 'github-token' }),
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve(mockProfile),
        });

      mockConfigService.get.mockReturnValue('test-value');
      mockUserRepository.getOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.github('test-code');

      expect(result).toEqual({ authToken: 'jwt-token' });
    });

    it('should throw UnauthorizedException for invalid profile', async () => {
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ access_token: 'github-token' }),
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve(null),
        });

      mockConfigService.get.mockReturnValue('test-value');

      await expect(service.github('invalid-code')).rejects.toThrow(UnauthorizedException);
    });
  });
});