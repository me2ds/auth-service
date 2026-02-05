import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateCompositionDto {
  @IsString()
  name: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  size?: number;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsString()
  coverImage?: string;
}
