import { Injectable } from '@nestjs/common';
import { validateURL, getInfo } from "ytdl-core"

@Injectable()
export class ConvertService {
	async convert(link: string) {
		
		if (!validateURL(link)) {
			throw new Error("Invalid link")
		}
		
		return await getInfo(link);
	}
}
