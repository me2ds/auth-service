import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entity/user.entity';
import { Repository } from 'typeorm';
import { OAuth2Client } from "google-auth-library";

@Injectable()
export class AuthService {
  private githubApiUrl = "https://api.github.com/user"
  private OAuthClient = new OAuth2Client()
	constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private configService: ConfigService,
    private jwtService: JwtService
  ) {}
	
	async github(code: string) {
		const clientId = this.configService.get("GITHUB_CLIENT_ID")
		const clientSecret = this.configService.get("GITHUB_CLIENT_SECRET")
		const url = 
			`https://github.com/login/oauth/access_token?
			client_id=${clientId}&
			client_secret=${clientSecret}&
			code=${code}`
		const authResponse = await fetch(url, {
			method: "GET",
			headers: {
    		Accept: "application/json",
      	"Accept-Encoding": "application/json",
			},
		})
		const githubUserData = await authResponse.json()
		const accessToken = githubUserData.access_token
    const profileResponse = await fetch(this.githubApiUrl, {
			method: "get",
			headers: {
				Authorization: accessToken,
			}
		})
		
		const profile = await profileResponse.json()
    console.log(profile)
    const user = await this.userRepository.findOne({
      where: {
        authIds: profile.id,
      }
    })
    if (!user) {
      const newUser = this.userRepository.create({
        authIds: [profile.id],
        username: profile.login,
        avatar: profile.avatar_url,
      })
      await this.userRepository.save(newUser)
      const jwtToken = this.jwtService.sign({ id: newUser.id, authToken: accessToken })
      return { jwtToken }
    }
    const jwtToken = this.jwtService.sign({ id: user.id, authToken: accessToken })
    return { jwtToken }
	}
	
	async google(code: string) {
		const clientId = this.configService.get<string>("GOOGLE_CLIENT_ID")
		const clientSecret = this.configService.get<string>("GOOGLE_CLIENT_SECRET")
		const callbackUrl = this.configService.get<string>("GOOGLE_CALLBACK_URL")
		const googleApiUrl = "https://oauth2.googleapis.com/token"
		const authResponse = await fetch(googleApiUrl, {
			method: "post",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				code,
				client_id: clientId,
				client_secret: clientSecret,
				grant_type: "authorization_code",
				redirect_uri: callbackUrl,
			})
		})
		const { id_token: accessToken } = await authResponse.json()
		const ticket = await this.OAuthClient.verifyIdToken({
			idToken: accessToken,
			audience: clientId
		})
		const profile = ticket.getPayload()
    const user = await this.userRepository.findOne({
      where: {
        authIds: profile?.at_hash,
      }
    })
    console.log(profile)
    if (!user) {
      const newUser = this.userRepository.create({
        authIds: [profile?.at_hash || ""],
        username: profile?.name || "",
        avatar: profile?.picture || "",
      })
      await this.userRepository.save(newUser)
      const jwtToken = this.jwtService.sign({ id: newUser.id, authToken: accessToken })
      return { jwtToken }
    }
    const jwtToken = this.jwtService.sign({ id: user.id, authToken: accessToken })
    return { jwtToken }
	}
}
