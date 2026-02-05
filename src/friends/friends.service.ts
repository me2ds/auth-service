import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entity/user.entity';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async addFriend(userId: string, friendId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friends'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const friend = await this.userRepository.findOne({
      where: { id: friendId },
    });

    if (!friend) {
      throw new NotFoundException(`Friend with ID ${friendId} not found`);
    }

    if (!user.friends) {
      user.friends = [];
    }

    if (!user.friends.some((f) => f.id === friendId)) {
      user.friends.push(friend);
      await this.userRepository.save(user);
    }

    return user;
  }

  async removeFriend(userId: string, friendId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friends'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    user.friends = user.friends.filter((f) => f.id !== friendId);
    return this.userRepository.save(user);
  }

  async getFriends(userId: string): Promise<User[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friends'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user.friends || [];
  }

  async checkFriendship(userId: string, friendId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friends'],
    });

    return user?.friends?.some((f) => f.id === friendId) || false;
  }
}
