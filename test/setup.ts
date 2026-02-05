import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from '../src/app.module';

export class TestHelper {
  private app: INestApplication;

  async setup(): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
          isGlobal: true,
        }),
        AppModule,
      ],
    }).compile();

    this.app = moduleFixture.createNestApplication();
    await this.app.init();

    return this.app;
  }

  async teardown(): Promise<void> {
    if (this.app) {
      await this.app.close();
    }
  }

  getApp(): INestApplication {
    return this.app;
  }
}

export const testHelper = new TestHelper();
