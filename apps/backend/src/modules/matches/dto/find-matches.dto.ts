import {
  IsString, IsNotEmpty, IsNumber,
  IsArray, IsOptional, Min, Max
} from 'class-validator';
import { Type } from 'class-transformer';

export class FindMatchesDto {
  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsOptional()
  @IsString()
  checkIn?: string;

  @IsOptional()
  @IsString()
  checkOut?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  guests?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  bedrooms?: number;

  @IsString()
  @IsOptional()
  groupType?: string;

  @IsArray()
  @IsOptional()
  moods?: string[];

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  budget?: number;

  @IsArray()
  @IsOptional()
  requiredAmenities?: string[];

  @IsString()
  @IsOptional()
  freeText?: string;

  @IsString()
  @IsOptional()
  userId?: string;
}
