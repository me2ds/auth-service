import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  roomId: string;
}
