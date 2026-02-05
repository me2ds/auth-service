import { IsUUID, IsOptional, IsNumber } from 'class-validator';

export class LogPlaybackDto {
  @IsUUID()
  compositionId: string;

  @IsOptional()
  @IsNumber()
  playedDuration?: number;
}
