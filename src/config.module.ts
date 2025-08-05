import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from './user/entity/user.entity';
import { Playlist } from './playlist/entities/playlist.entity';
import { Composition } from './composition/entities/composition.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.get<string>('POSTGRES_HOST'),
				port: configService.get<number>('POSTGRES_PORT'),
				username: configService.get<string>('POSTGRES_USER'),
				password: configService.get<string>('POSTGRES_PASSWORD'),
				database: configService.get<string>('POSTGRES_DB'),
				entities: [User, Playlist, Composition],
				synchronize: true, // отключить в production
			}),
		}),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      global: true,
    }),
  ],
})
export class ConfigAppModule {}