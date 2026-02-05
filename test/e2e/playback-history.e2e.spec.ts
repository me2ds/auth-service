import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ConfigModule } from '@nestjs/config';

describe('Playback History (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let userId: string;
  let compositionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
          isGlobal: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Note: In real tests, you'd need to setup auth properly
    // This is a simplified example
    jwtToken = process.env.TEST_JWT_TOKEN || 'test-token';
    userId = 'test-user-id';
    compositionId = 'test-composition-id';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /playback-history', () => {
    it('should log playback', async () => {
      const logPlaybackDto = {
        compositionId: compositionId,
        playedDuration: 180,
      };

      const response = await request(app.getHttpServer())
        .post('/playback-history')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(logPlaybackDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.compositionId).toBe(compositionId);
      expect(response.body.playedDuration).toBe(180);
    });
  });

  describe('GET /playback-history', () => {
    it('should get listening history', async () => {
      const response = await request(app.getHttpServer())
        .get('/playback-history')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should support limit parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/playback-history?limit=10')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(10);
    });
  });

  describe('GET /playback-history/top-played', () => {
    it('should get top played compositions', async () => {
      const response = await request(app.getHttpServer())
        .get('/playback-history/top-played')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should support limit parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/playback-history/top-played?limit=5')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body.length).toBeLessThanOrEqual(5);
    });
  });
});
