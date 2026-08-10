import { 
  IsString, IsNotEmpty, IsNumber,
  IsOptional, IsEmail, Min, Max
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateVerificationDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(18)
  @Max(99)
  age: number;

  @IsString()
  @IsNotEmpty()
  idType: string;

  @IsString()
  @IsNotEmpty()
  idNumber: string;

  @IsString()
  @IsOptional()
  idPhotoUrl?: string;

  @IsString()
  @IsOptional()
  selfieUrl?: string;

  // Mobile client sends these (booking context that triggered the KYC flow) but
  // verification.service.ts never reads them — verification is a standalone
  // per-user gate, not tied to a specific booking. Kept optional rather than
  // required so the client doesn't hard-fail if it stops sending them, and not
  // deleted outright since that's a breaking DTO change for no functional gain.
  @IsString()
  @IsOptional()
  propertyId?: string;

  @IsString()
  @IsOptional()
  checkIn?: string;

  @IsString()
  @IsOptional()
  checkOut?: string;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsNumber()
  guests?: number;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsNumber()
  totalAmount?: number;
}

