import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SaveReelsDto {
  @IsUUID()
  @IsNotEmpty()
  propertyId: string;

  @IsArray()
  @IsString({ each: true })
  reelUrls: string[];
}
