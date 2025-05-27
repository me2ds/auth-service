import { Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @Post('github')
	async githubLogin(@Req() request: Request) {
		return this.authService.github(request.body.code)
  }
}
