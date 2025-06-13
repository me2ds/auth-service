import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async getProfile(authToken: string) {
    const decoded = this.jwtService.verify(authToken)
    const user = await this.userRepository.findOne({
      where: {
        id: decoded.id,
      },
    })
    return { user }
  }
}
