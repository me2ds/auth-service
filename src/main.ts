import { NestFactory } from '@nestjs/core';
import {
	FastifyAdapter,
	NestFastifyApplication
} from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { AppModule } from './app.module';

async function bootstrap() {
  const httpApp = await NestFactory.create<NestFastifyApplication>(
  	AppModule, 
   	new FastifyAdapter()
  );
  
  const config = new DocumentBuilder()
      .setTitle('Auth service')
      .setVersion('1.0')
      .addTag('Auth service')
      .build();
	const documentFactory = () => SwaggerModule.createDocument(httpApp, config);
	SwaggerModule.setup("api", httpApp, documentFactory);
  await httpApp.listen(
  	process.env.PORT ?? 3000, 
   	process.env.HOST ?? "0.0.0.0"
  );
  
}
bootstrap();

