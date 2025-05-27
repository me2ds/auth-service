import { Controller, Get, Param } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
  
  @Get("token/:token")
	async getProfile(@Param("token") token: string) {
  	return this.profileService.getProfileWithToken(token)
  }
}
