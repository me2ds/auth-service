import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { FileStorageService } from '../src/file-storage/file-storage.service';
import { S3StorageService } from '../src/file-storage/s3-storage.service';
import { BadRequestException } from '@nestjs/common';

describe('FileStorageService', () => {
  let service: FileStorageService;
  let s3StorageService: S3StorageService;

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test.mp3',
    encoding: '7bit',
    mimetype: 'audio/mpeg',
    destination: './uploads',
    filename: 'test.mp3',
    path: './uploads/test.mp3',
    size: 1024,
    buffer: Buffer.from('test'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
      ],
      providers: [
        FileStorageService,
        {
          provide: S3StorageService,
          useValue: {
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
            getSignedUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FileStorageService>(FileStorageService);
    s3StorageService = module.get<S3StorageService>(S3StorageService);
  });

  describe('uploadFile', () => {
    it('should upload file to S3', async () => {
      const expectedUrl = 'https://bucket.s3.amazonaws.com/audio/test-uuid.mp3';

      jest.spyOn(s3StorageService, 'uploadFile').mockResolvedValue(expectedUrl);

      const result = await service.uploadFile(mockFile, 'audio');

      expect(result).toBe(expectedUrl);
      expect(s3StorageService.uploadFile).toHaveBeenCalledWith(
        mockFile,
        'audio',
      );
    });

    it('should reject invalid file types', async () => {
      const invalidFile = {
        ...mockFile,
        mimetype: 'application/pdf',
        originalname: 'test.pdf',
      };

      jest
        .spyOn(s3StorageService, 'uploadFile')
        .mockRejectedValue(new BadRequestException('Invalid file type'));

      await expect(service.uploadFile(invalidFile, 'audio')).rejects.toThrow();
    });
  });

  describe('deleteFile', () => {
    it('should delete file from S3', async () => {
      const filePath = 'https://bucket.s3.amazonaws.com/audio/test-uuid.mp3';

      jest.spyOn(s3StorageService, 'deleteFile').mockResolvedValue(undefined);

      await service.deleteFile(filePath);

      expect(s3StorageService.deleteFile).toHaveBeenCalledWith(filePath);
    });
  });

  describe('getSignedUrl', () => {
    it('should get signed URL from S3', async () => {
      const key = 'audio/test-uuid.mp3';
      const expectedUrl =
        'https://bucket.s3.amazonaws.com/audio/test-uuid.mp3?signature=xyz';

      jest
        .spyOn(s3StorageService, 'getSignedUrl')
        .mockResolvedValue(expectedUrl);

      const result = await service.getSignedUrl(key, 3600);

      expect(result).toContain('signature');
      expect(s3StorageService.getSignedUrl).toHaveBeenCalledWith(key, 3600);
    });
  });
});
