import { 
  IsString, IsNotEmpty, IsNumber,
  IsArray, IsOptional, IsObject,
  Min, ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsOptional()
  pincode?: string;
}

class CapacityDto {
  @IsNumber()
  @Min(1)
  rooms: number;

  @IsNumber()
  @Min(1)
  maxGuests: number;

  @IsNumber()
  @Min(1)
  comfortableGuests: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  bathrooms?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  beds?: number;
}

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  tagline?: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ValidateNested()
  @Type(() => CapacityDto)
  capacity: CapacityDto;

  @IsNumber()
  @Min(0)
  pricePerNight: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  weekendPrice?: number;

  @IsArray()
  @IsOptional()
  amenities?: string[];

  @IsArray()
  @IsOptional()
  activities?: string[];

  @IsString()
  @IsOptional()
  honestNotes?: string;

  @IsString()
  @IsOptional()
  hostStory?: string;

  @IsArray()
  @IsOptional()
  photos?: string[];

  @IsNumber()
  @IsOptional()
  minimumStay?: number;

  @IsString()
  @IsOptional()
  cancellationPolicy?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
