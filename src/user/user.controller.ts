import { Controller, Get, Headers, Req } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile(@Headers('authorization') authToken: string) {
    return this.userService.getProfile(authToken.split(' ')[1])
  }
}
