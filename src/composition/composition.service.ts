import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Composition } from './entities/composition.entity';
import { CreateCompositionDto } from './dto/create-composition.dto';
import { UpdateCompositionDto } from './dto/update-composition.dto';

@Injectable()
export class CompositionService {
  constructor(
    @InjectRepository(Composition)
    private readonly compositionRepository: Repository<Composition>,
  ) {}

  async create(
    createCompositionDto: CreateCompositionDto,
  ): Promise<Composition> {
    const composition = this.compositionRepository.create(createCompositionDto);
    return await this.compositionRepository.save(composition);
  }

  async findAll(): Promise<Composition[]> {
    return await this.compositionRepository.find();
  }

  async findByOwnerId(ownerId: string): Promise<Composition[]> {
    return await this.compositionRepository.find({
      where: { ownerId },
    });
  }

  async findOne(id: string): Promise<Composition> {
    const composition = await this.compositionRepository.findOne({
      where: { id },
    });

    if (!composition) {
      throw new NotFoundException(`Composition with ID ${id} not found`);
    }

    return composition;
  }

  async update(
    id: string,
    updateCompositionDto: UpdateCompositionDto,
    userId: string,
  ): Promise<Composition> {
    const composition = await this.findOne(id);
    
    if (composition.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to update this composition');
    }
    
    Object.assign(composition, updateCompositionDto);
    return await this.compositionRepository.save(composition);
  }

  async remove(id: string, userId: string): Promise<void> {
    const composition = await this.findOne(id);
    
    if (composition.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this composition');
    }
    
    await this.compositionRepository.remove(composition);
  }
}
