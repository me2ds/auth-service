import { Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Controller('user/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @Post('github')
	async githubLogin(@Req() request: Request) {
		return this.authService.github(request.body.code)
  }
  
  @Post('google')
  async googleLogin(@Req() request: Request) {
  	return this.authService.google(request.body.code)
  }
}
