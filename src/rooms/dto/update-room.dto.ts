import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';

export class UpdateRoomDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @IsOptional()
  @IsString()
  currentPlaylistId?: string;

  @IsOptional()
  @IsNumber()
  currentTrackIndex?: number;

  @IsOptional()
  @IsNumber()
  currentPosition?: number;

  @IsOptional()
  @IsBoolean()
  isPlaying?: boolean;
}
