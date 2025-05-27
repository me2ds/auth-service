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
		
	}
	
	async telegram(code: string) {
		
	}
}
