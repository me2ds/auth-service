import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsArray()
  @IsNotEmpty()
  authIds: string[];

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}