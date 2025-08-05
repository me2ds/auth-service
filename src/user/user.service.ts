import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const cacheKey = `user:${id}`;
    const cachedUser = await this.cacheManager.get<User>(cacheKey);
    
    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.cacheManager.set(cacheKey, user, 300000); // 5 минут
    return user;
  }

  async updateProfile(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findOne(userId);

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);
    
    const cacheKey = `user:${userId}`;
    await this.cacheManager.set(cacheKey, updatedUser, 300000);
    
    return updatedUser;
  }

  async deleteProfile(userId: string): Promise<void> {
    const user = await this.findOne(userId);

    await this.userRepository.remove(user);
    
    const cacheKey = `user:${userId}`;
    await this.cacheManager.del(cacheKey);
  }
}
