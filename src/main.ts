import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

const methods = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
const bodyLimit = 50 * 1024 * 1024;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
  });

  app.enableCors({
    origin: true,
    credentials: true,
    methods: methods,
  });

  const configService = app.get<ConfigService>(ConfigService);

  const config = new DocumentBuilder()
    .setTitle('Desme Audio Player')
    .setVersion('1.0')
    .setDescription('Audio player for collaborative listening with friends')
    .addTag('Auth')
    .addTag('User')
    .addTag('Rooms')
    .addTag('Composition')
    .addTag('Playlist')
    .addTag('Friends')
    .addTag('Messages')
    .addTag('Files')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const port = configService.get<number>('PORT') ?? 8000;
  const host = configService.get<string>('HOST') ?? '0.0.0.0';

  await app.listen(port, host);
  console.log(`Server running on http://${host}:${port}`);
}

bootstrap();
