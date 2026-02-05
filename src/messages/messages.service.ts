import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async create(
    createMessageDto: CreateMessageDto,
    senderId: string,
  ): Promise<Message> {
    const message = this.messageRepository.create({
      ...createMessageDto,
      senderId,
    });
    return this.messageRepository.save(message);
  }

  async findByRoom(roomId: string, limit: number = 50): Promise<Message[]> {
    return this.messageRepository.find({
      where: { roomId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findOne(id: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: ['sender'],
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    return message;
  }

  async update(
    id: string,
    updateMessageDto: UpdateMessageDto,
    userId: string,
  ): Promise<Message> {
    const message = await this.findOne(id);

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    Object.assign(message, updateMessageDto);
    return this.messageRepository.save(message);
  }

  async delete(id: string, userId: string): Promise<void> {
    const message = await this.findOne(id);

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.messageRepository.remove(message);
  }
}
