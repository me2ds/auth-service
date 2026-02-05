import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { AddFriendDto } from './dto/add-friend.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post()
  async addFriend(@Body() addFriendDto: AddFriendDto, @CurrentUser() user) {
    return this.friendsService.addFriend(user.id, addFriendDto.friendId);
  }

  @Get()
  async getFriends(@CurrentUser() user) {
    return this.friendsService.getFriends(user.id);
  }

  @Delete(':friendId')
  async removeFriend(@Param('friendId') friendId: string, @CurrentUser() user) {
    await this.friendsService.removeFriend(user.id, friendId);
    return { message: 'Friend removed successfully' };
  }

  @Get('check/:friendId')
  async checkFriendship(
    @Param('friendId') friendId: string,
    @CurrentUser() user,
  ) {
    const isFriend = await this.friendsService.checkFriendship(
      user.id,
      friendId,
    );
    return { isFriend };
  }
}
