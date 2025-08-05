import { Test, TestingModule } from '@nestjs/testing';
import { CompositionService } from './composition.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Composition } from './entities/composition.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CompositionService', () => {
  let service: CompositionService;
  let mockCompositionRepository: any;

  beforeEach(async () => {
    mockCompositionRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompositionService,
        {
          provide: getRepositoryToken(Composition),
          useValue: mockCompositionRepository,
        },
      ],
    }).compile();

    service = module.get<CompositionService>(CompositionService);
  });

  describe('create', () => {
    it('should create and return composition', async () => {
      const createDto = { 
        name: 'Test Song', 
        content: 'song content', 
        ownerId: 'user-id' 
      };
      const mockComposition = { id: 'composition-id', ...createDto };

      mockCompositionRepository.create.mockReturnValue(mockComposition);
      mockCompositionRepository.save.mockResolvedValue(mockComposition);

      const result = await service.create(createDto);

      expect(result).toEqual(mockComposition);
      expect(mockCompositionRepository.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all compositions', async () => {
      const mockCompositions = [
        { id: 'composition-1', name: 'Song 1' },
        { id: 'composition-2', name: 'Song 2' }
      ];
      mockCompositionRepository.find.mockResolvedValue(mockCompositions);

      const result = await service.findAll();

      expect(result).toEqual(mockCompositions);
      expect(mockCompositionRepository.find).toHaveBeenCalled();
    });
  });

  describe('findByOwnerId', () => {
    it('should return compositions by owner id', async () => {
      const mockCompositions = [{ id: 'composition-1', ownerId: 'user-id' }];
      mockCompositionRepository.find.mockResolvedValue(mockCompositions);

      const result = await service.findByOwnerId('user-id');

      expect(result).toEqual(mockCompositions);
      expect(mockCompositionRepository.find).toHaveBeenCalledWith({
        where: { ownerId: 'user-id' },
      });
    });
  });

  describe('findOne', () => {
    it('should return composition by id', async () => {
      const mockComposition = { id: 'composition-id', name: 'Test Song' };
      mockCompositionRepository.findOne.mockResolvedValue(mockComposition);

      const result = await service.findOne('composition-id');

      expect(result).toEqual(mockComposition);
      expect(mockCompositionRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'composition-id' },
      });
    });

    it('should throw NotFoundException if composition not found', async () => {
      mockCompositionRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update composition if user is owner', async () => {
      const updateDto = { name: 'Updated Song' };
      const mockComposition = { 
        id: 'composition-id', 
        ownerId: 'user-id', 
        name: 'Test Song' 
      };
      const updatedComposition = { ...mockComposition, ...updateDto };

      mockCompositionRepository.findOne.mockResolvedValue(mockComposition);
      mockCompositionRepository.save.mockResolvedValue(updatedComposition);

      const result = await service.update('composition-id', updateDto, 'user-id');

      expect(result).toEqual(updatedComposition);
      expect(mockCompositionRepository.save).toHaveBeenCalledWith(updatedComposition);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const mockComposition = { 
        id: 'composition-id', 
        ownerId: 'other-user-id' 
      };
      mockCompositionRepository.findOne.mockResolvedValue(mockComposition);

      await expect(service.update('composition-id', {}, 'user-id'))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove composition if user is owner', async () => {
      const mockComposition = { 
        id: 'composition-id', 
        ownerId: 'user-id' 
      };
      mockCompositionRepository.findOne.mockResolvedValue(mockComposition);

      await service.remove('composition-id', 'user-id');

      expect(mockCompositionRepository.remove).toHaveBeenCalledWith(mockComposition);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const mockComposition = { 
        id: 'composition-id', 
        ownerId: 'other-user-id' 
      };
      mockCompositionRepository.findOne.mockResolvedValue(mockComposition);

      await expect(service.remove('composition-id', 'user-id'))
        .rejects.toThrow(ForbiddenException);
    });
  });
});