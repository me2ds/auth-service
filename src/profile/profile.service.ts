import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfileService {
	
	async getProfileWithToken(token: string) {
		const githubApiUrl = "https://api.github.com/user"
		const response = await fetch(githubApiUrl, {
			method: "get",
			headers: {
				Authorization: `Bearer ${token}`,
			}
		})
		
		const profile = await response.json()
		return { user: profile }
	}

}
