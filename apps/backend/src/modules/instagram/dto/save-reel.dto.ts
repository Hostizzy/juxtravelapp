import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class SaveReelDto {
  @IsString()
  @IsNotEmpty()
  reelUrl: string;
}
