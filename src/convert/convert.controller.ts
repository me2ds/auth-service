import { Controller, Post, Req } from '@nestjs/common';
import { ConvertService } from './convert.service';
import { Request } from 'express';

@Controller('convert')
export class ConvertController {
  constructor(private readonly convertService: ConvertService) {}
  
  @Post()
  async convert(@Req() req: Request) {
  	return this.convertService.convert(req.body.link)
  }
}
