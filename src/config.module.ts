import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entity/user.entity';

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
				entities: [User],
				synchronize: true, // отключить в production
			}),
		}),
  ],
})
export class ConfigAppModule {}