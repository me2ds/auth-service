import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository, Like } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['friends', 'playlists'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['friends', 'playlists', 'compositions'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['friends', 'playlists'],
    });
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return user;
  }

  async searchUsers(query: string, limit: number = 20): Promise<User[]> {
    return this.userRepository.find({
      where: [
        {
          username: Like(`%${query}%`),
        },
      ],
      take: limit,
      relations: ['friends'],
    });
  }

  async updateProfile(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findOne(userId);

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    return updatedUser;
  }

  async deleteProfile(userId: string): Promise<void> {
    const user = await this.findOne(userId);
    await this.userRepository.remove(user);
  }
}
