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

  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @IsString()
  @IsNotEmpty()
  checkIn: string;

  @IsString()
  @IsNotEmpty()
  checkOut: string;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  guests: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  totalAmount: number;
}

