import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from "google-auth-library"

@Injectable()
export class ProfileService {
	private githubApiUrl = "https://api.github.com/user"
	private OAuthClient = new OAuth2Client()
	
	constructor(
		private configService: ConfigService) {}
	
	async getGithubProfileWithToken(token: string) {
		const response = await fetch(this.githubApiUrl, {
			method: "get",
			headers: {
				Authorization: token,
			}
		})
		
		const profile = await response.json()
		return {
			user: {
				id: profile.id,
				login: profile.login,
				name: profile.name,
				email: profile.email,
				avatar_url: profile.avatar_url
			}
		}
	}
	
	async getGoogleProfileWithToken(token: string) {
		const clientId = this.configService.get("GOOGLE_CLIENT_ID")
		const ticket = await this.OAuthClient.verifyIdToken({
			idToken: token.split(" ")[1],
			audience: clientId
		})
		const profile = ticket.getPayload()
		return {
			user: {
				id: profile?.at_hash,
				login: profile?.name,
				name: profile?.name,
				email: profile?.email,
				avatar_url: profile?.picture
			}
		}
	}
}
