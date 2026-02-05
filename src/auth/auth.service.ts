import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entity/user.entity';
import { Repository } from 'typeorm';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private githubApiUrl = 'https://api.github.com/user';
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async github(code: string) {
    const clientId = this.configService.get('GITHUB_CLIENT_ID');
    const clientSecret = this.configService.get('GITHUB_CLIENT_SECRET');
    const tokenUrl = 'https://github.com/login/oauth/access_token';
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
    });
    const authResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    const githubUserData = await authResponse.json();
    // Log token exchange result (mask token)
    console.log('GitHub token exchange', {
      status: authResponse.status,
      ok: authResponse.ok,
      accessToken: githubUserData?.access_token
        ? `${String(githubUserData.access_token).slice(0, 6)}...`
        : null,
      raw: { error: githubUserData?.error },
    });
    const accessToken = githubUserData?.access_token;
    if (!accessToken) {
      console.error('GitHub token missing', githubUserData);
      throw new UnauthorizedException('GitHub token exchange failed');
    }
    const profileResponse = await fetch(this.githubApiUrl, {
      method: 'get',
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    console.log('GitHub profile fetch', {
      status: profileResponse.status,
      ok: profileResponse.ok,
    });
    if (!profileResponse.ok) {
      const body = await profileResponse.text().catch(() => '<unreadable>');
      console.error('GitHub profile fetch failed', {
        status: profileResponse.status,
        body,
      });
      throw new UnauthorizedException(
        `Invalid github code ${profileResponse.statusText}`,
      );
    }
    const profile = await profileResponse.json();
    console.log('GitHub profile', { id: profile?.id, login: profile?.login });
    if (!profile || !profile.id) {
      console.error('Invalid GitHub profile object', profile);
      throw new UnauthorizedException(
        `Invalid github profile ${JSON.stringify(profile)}`,
      );
    }
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where(':id = ANY(user.authIds)', { id: String(profile.id) })
      .getOne();
    if (!user) {
      const newUserData = {
        authIds: [String(profile.id)],
        username:
          profile.login ?? `github_user_${String(profile.id)}`,
        avatar: profile.avatar_url,
      };
      console.log('Creating new user from GitHub', newUserData);
      let newUser;
      try {
        newUser = this.userRepository.create(newUserData);
        await this.userRepository.save(newUser);
      } catch (e) {
        console.error('Failed to save new user', e);
        throw e;
      }
      const authToken = this.jwtService.sign({ id: newUser.id });
      return { authToken };
    }
    const authToken = this.jwtService.sign({ id: user.id });
    return { authToken };
  }

  async google(code: string) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackUrl = this.configService.get<string>('GOOGLE_CALLBACK_URL');
    const OAuthClient = new OAuth2Client(clientId, clientSecret, callbackUrl);
    const { tokens } = await OAuthClient.getToken(code);
    console.log('Google getToken', {
      hasTokens: !!tokens,
      idToken: tokens?.id_token
        ? `${String(tokens.id_token).slice(0, 6)}...`
        : null,
    });
    if (!tokens) {
      console.error('Google tokens missing', tokens);
      throw new UnauthorizedException('Invalid google code');
    }
    const accessToken = tokens.id_token!;
    const ticket = await OAuthClient.verifyIdToken({
      idToken: accessToken,
      audience: clientId,
    });
    const profile = ticket.getPayload();
    console.log('Google profile payload', {
      email: profile?.email,
      name: profile?.name,
    });
    if (!profile || !profile.email) {
      console.error('Invalid Google profile', profile);
      throw new UnauthorizedException('Invalid google profile');
    }
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where(':id = ANY(user.authIds)', { id: profile.email })
      .getOne();
    if (!user) {
      const newUserData = {
        authIds: [profile.email],
        username: profile.name ?? profile.email,
        avatar: profile.picture,
      };
      console.log('Creating new user from Google', {
        email: profile.email,
        name: profile.name,
      });
      let newUser;
      try {
        newUser = this.userRepository.create(newUserData);
        await this.userRepository.save(newUser);
      } catch (e) {
        console.error('Failed to save Google new user', e);
        throw e;
      }
      const authToken = this.jwtService.sign({ id: newUser.id });
      return { authToken };
    }
    const authToken = this.jwtService.sign({ id: user.id });
    return { authToken };
  }
}
