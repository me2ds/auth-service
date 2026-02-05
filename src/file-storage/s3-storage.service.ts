import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@nestjs/common';

@Injectable()
export class S3StorageService {
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;
  private logger = new Logger(S3StorageService.name);

  constructor(private configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET') || '';

    const endpoint = this.configService.get<string>('AWS_ENDPOINT_URL');
    const accessKeyId =
      this.configService.get<string>('AWS_ACCESS_KEY_ID') || '';
    const secretAccessKey =
      this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '';

    if (!this.bucketName) {
      throw new Error('AWS_S3_BUCKET is not configured');
    }

    const s3Config: any = {
      region: this.region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    };

    if (endpoint) {
      s3Config.endpoint = endpoint;
      s3Config.forcePathStyle = true;
    }

    this.s3Client = new S3Client(s3Config);
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: 'avatars' | 'banners' | 'audio',
  ): Promise<string> {
    try {
      const fileExtension = this.getFileExtension(file.originalname);
      const filename = `${folder}/${uuidv4()}${fileExtension}`;

      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: filename,
          Body: file.buffer,
          ContentType: file.mimetype,
          Metadata: {
            'original-filename': file.originalname,
            'upload-date': new Date().toISOString(),
          },
        },
      });

      const result = await upload.done();
      const fileUrl = this.getFileUrl(filename);

      this.logger.log(`File uploaded successfully: ${filename}`);
      return fileUrl;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw new BadRequestException('Failed to upload file');
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      // Extract key from URL
      const key = filePath.includes('http')
        ? new URL(filePath).pathname.substring(1)
        : filePath;

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );

      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      throw new BadRequestException('Failed to delete file');
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const baseUrl = this.getBaseUrl();
      // Note: For presigned URLs, use AWS SDK v3 getSignedUrl utility
      // This is a simplified version
      return `${baseUrl}/${key}`;
    } catch (error) {
      this.logger.error(`Failed to generate signed URL: ${error.message}`);
      throw new BadRequestException('Failed to generate signed URL');
    }
  }

  private getFileExtension(originalname: string): string {
    const parts = originalname.split('.');
    return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
  }

  private getFileUrl(key: string): string {
    const baseUrl = this.getBaseUrl();
    return `${baseUrl}/${key}`;
  }

  private getBaseUrl(): string {
    const endpoint = this.configService.get<string>('AWS_ENDPOINT_URL');
    const customUrl = this.configService.get<string>('AWS_S3_URL');

    if (customUrl) {
      return customUrl;
    }

    if (endpoint) {
      return `${endpoint}/${this.bucketName}`;
    }

    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com`;
  }

  async getFileStream(key: string): Promise<Buffer> {
    try {
      const result = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );

      const chunks: Uint8Array[] = [];
      if (result.Body) {
        const reader = result.Body as any;
        for await (const chunk of reader) {
          chunks.push(chunk);
        }
      }

      return Buffer.concat(chunks.map((c) => Buffer.from(c)));
    } catch (error) {
      this.logger.error(`Failed to get file: ${error.message}`);
      throw new BadRequestException('Failed to retrieve file');
    }
  }
}
