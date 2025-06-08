import { Controller, Get, Headers } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('user/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
  
  @Get("github")
	async getGithubProfile(@Headers('authorization') token: string) {
  	return this.profileService.getGithubProfileWithToken(token)
  }
  @Get("google")
  async getGoogleProfile(@Headers('authorization') token: string) {
  	return this.profileService.getGoogleProfileWithToken(token)
  }
}
