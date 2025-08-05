import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

const methods = ['GET', 'HAED', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
const bodyLimit = 50 * 1024 * 1024;

async function bootstrap() {
  const httpApp = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: {
        level: 'info',
      },
      bodyLimit: bodyLimit
    }),
  );
  httpApp.enableCors({
    origin: true,
    credentials: true,
    methods: methods,
  });
  const configService = httpApp.get<ConfigService>(ConfigService);

  const config = new DocumentBuilder()
    .setTitle('Auth service')
    .setVersion('1.0')
    .addTag('Auth service')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(httpApp, config);
  SwaggerModule.setup('api', httpApp, documentFactory);

  const port = configService.get<number>('PORT') ?? 3000;
  const host = configService.get<string>('HOST') ?? '0.0.0.0';

  await httpApp.listen(port, host);
}

bootstrap();
