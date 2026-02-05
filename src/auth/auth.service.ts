import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entity/user.entity';
import { Repository } from 'typeorm';
import { OAuth2Client } from "google-auth-library";

@Injectable()
export class AuthService {
  private githubApiUrl = "https://api.github.com/user"
	constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private configService: ConfigService,
    private jwtService: JwtService
  ) {}
	
	async github(code: string) {
		const clientId = this.configService.get("GITHUB_CLIENT_ID")
		const clientSecret = this.configService.get("GITHUB_CLIENT_SECRET")
		const tokenUrl = "https://github.com/login/oauth/access_token"
		const params = new URLSearchParams({
			client_id: clientId,
			client_secret: clientSecret,
			code: code
		})
		const authResponse = await fetch(tokenUrl, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: params.toString(),
		})
		const githubUserData = await authResponse.json()
		const accessToken = githubUserData?.access_token
		if (!accessToken) {
			throw new UnauthorizedException("GitHub token exchange failed")
		}
    const profileResponse = await fetch(this.githubApiUrl, {
			method: "get",
			headers: {
				Authorization: `token ${accessToken}`,
				Accept: "application/vnd.github.v3+json"
			},
		})
    if (!profileResponse.ok) {
      throw new UnauthorizedException("Invalid github code")
    }
		const profile = await profileResponse.json()
    if (!profile || !profile.id) {
      throw new UnauthorizedException("Invalid github profile")
    }
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where(":id = ANY(user.authIds)", { id: String(profile.id) })
      .getOne()
    if (!user) {
      const newUser = this.userRepository.create({
        authIds: [String(profile.id)],
        username: String(profile.login) ?? `github_user_${profile.id}`,
        avatar: profile.avatar_url,
      })
      await this.userRepository.save(newUser)
      const authToken = this.jwtService.sign({ id: newUser.id })
      return { authToken }
    }
    const authToken = this.jwtService.sign({ id: user.id })
    return { authToken }
	}
	
	async google(code: string) {
		const clientId = this.configService.get<string>("GOOGLE_CLIENT_ID")
		const clientSecret = this.configService.get<string>("GOOGLE_CLIENT_SECRET")
		const callbackUrl = this.configService.get<string>("GOOGLE_CALLBACK_URL")
    const OAuthClient = new OAuth2Client(clientId, clientSecret, callbackUrl)
		const { tokens } = await OAuthClient.getToken(code)
    if (!tokens) {
      throw new UnauthorizedException("Invalid google code")
    }
    const accessToken = tokens.id_token!
		const ticket = await OAuthClient.verifyIdToken({
			idToken: accessToken,
			audience: clientId
		})
		const profile = ticket.getPayload()
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
      const authToken = this.jwtService.sign({ id: newUser.id })
      return { authToken }
    }
    const authToken = this.jwtService.sign({ id: user.id })
    return { authToken }
	}
}
