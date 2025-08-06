import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  private authServiceUrl: string
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private configService: ConfigService,
    private jwtService: JwtService
  ) {
    this.authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL')!
  }
	
	async github(code: string) {
		const profileRes = await fetch(this.authServiceUrl + "/github", {
      method: "GET",
      body: JSON.stringify({ code }),
    })
    if (!profileRes.ok) throw new UnauthorizedException()
    const profile = await profileRes.json()
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where(":id = ANY(user.authIds)", { id: profile.id })
      .getOne()
    if (!user) {
      const newUser = this.userRepository.create({
        authIds: [profile.id],
        username: profile.login,
        avatar: profile.avatar_url,
      })
      await this.userRepository.save(newUser)
      const authToken = this.jwtService.sign({ user: newUser })
      return { authToken }
    }
    const authToken = this.jwtService.sign({ user: user })
    return { authToken }
	}
	
	async google(code: string) {
		const profileRes = await fetch(this.authServiceUrl + "/google", {
      method: "GET",
      body: JSON.stringify({ code }),
    })
    if (!profileRes.ok) throw new UnauthorizedException()
    const profile = await profileRes.json()
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where(":id = ANY(user.authIds)", { id: profile?.email })
      .getOne()
    if (!user) {
      const newUser = this.userRepository.create({
        authIds: [profile?.email || ""],
        username: profile?.name,
        avatar: profile?.picture,
      })
      await this.userRepository.save(newUser)
      const authToken = this.jwtService.sign({ user: newUser })
      return { authToken }
    }
    const authToken = this.jwtService.sign({ user: user })
    return { authToken }
	}
}
