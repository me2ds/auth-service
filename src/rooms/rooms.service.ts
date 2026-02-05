import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { User } from '../user/entity/user.entity';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createRoomDto: CreateRoomDto, creatorId: string): Promise<Room> {
    const room = this.roomRepository.create({
      ...createRoomDto,
      creatorId,
      members: [{ id: creatorId } as User],
    });
    return this.roomRepository.save(room);
  }

  async findAll(userId?: string): Promise<Room[]> {
    const query = this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.creator', 'creator')
      .leftJoinAndSelect('room.members', 'members')
      .leftJoinAndSelect('room.currentPlaylist', 'playlist');

    if (userId) {
      query.where('room.isPrivate = false OR room.creatorId = :userId', {
        userId,
      });
    } else {
      query.where('room.isPrivate = false');
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Room> {
    const room = await this.roomRepository.findOne({
      where: { id },
      relations: ['creator', 'members', 'currentPlaylist'],
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    return room;
  }

  async update(
    id: string,
    updateRoomDto: UpdateRoomDto,
    userId: string,
  ): Promise<Room> {
    const room = await this.findOne(id);

    if (room.creatorId !== userId) {
      throw new ForbiddenException('Only room creator can update the room');
    }

    Object.assign(room, {
      ...updateRoomDto,
      lastActivityAt: new Date(),
    });

    return this.roomRepository.save(room);
  }

  async delete(id: string, userId: string): Promise<void> {
    const room = await this.findOne(id);

    if (room.creatorId !== userId) {
      throw new ForbiddenException('Only room creator can delete the room');
    }

    await this.roomRepository.remove(room);
  }

  async addMember(
    roomId: string,
    userId: string,
    memberId: string,
  ): Promise<Room> {
    const room = await this.findOne(roomId);
    const user = await this.userRepository.findOne({ where: { id: memberId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${memberId} not found`);
    }

    if (!room.members.some((m) => m.id === memberId)) {
      room.members.push(user);
      room.lastActivityAt = new Date();
      return this.roomRepository.save(room);
    }

    return room;
  }

  async removeMember(
    roomId: string,
    userId: string,
    memberId: string,
  ): Promise<Room> {
    const room = await this.findOne(roomId);

    if (room.creatorId !== userId && userId !== memberId) {
      throw new ForbiddenException(
        'Only room creator or member themselves can remove a member',
      );
    }

    room.members = room.members.filter((m) => m.id !== memberId);
    room.lastActivityAt = new Date();
    return this.roomRepository.save(room);
  }

  async getRoomMembers(id: string): Promise<User[]> {
    const room = await this.findOne(id);
    return room.members;
  }

  async updatePlayback(
    id: string,
    userId: string,
    playbackData: {
      isPlaying?: boolean;
      currentPosition?: number;
      currentTrackIndex?: number;
    },
  ): Promise<Room> {
    const room = await this.findOne(id);

    if (room.creatorId !== userId) {
      throw new ForbiddenException('Only room creator can control playback');
    }

    Object.assign(room, {
      ...playbackData,
      lastActivityAt: new Date(),
    });

    return this.roomRepository.save(room);
  }
}
