import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async create(
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() user,
  ) {
    return this.messagesService.create(createMessageDto, user.id);
  }

  @Get('room/:roomId')
  async findByRoom(
    @Param('roomId') roomId: string,
    @Query('limit') limit: number = 50,
  ) {
    return this.messagesService.findByRoom(roomId, limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.messagesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @CurrentUser() user,
  ) {
    return this.messagesService.update(id, updateMessageDto, user.id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user) {
    await this.messagesService.delete(id, user.id);
    return { message: 'Message deleted successfully' };
  }
}
