import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
	constructor(private configService: ConfigService) {}
	
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
		return { token: accessToken }
	}
	
	async google(code: string) {
		const clientId = this.configService.get("GOOGLE_CLIENT_ID")
		const clientSecret = this.configService.get("GOOGLE_CLIENT_SECRET")
		const callbackUrl = this.configService.get("GOOGLE_CALLBACK_URL")
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
		const { id_token } = await authResponse.json()
		return { token: id_token }
	}
}
