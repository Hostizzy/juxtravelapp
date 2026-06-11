import { 
  IsString, IsNotEmpty, IsNumber,
  IsOptional, IsEmail, Min, Max
} from 'class-validator';

export class CreateVerificationDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

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

  @IsNumber()
  guests: number;

  @IsNumber()
  totalAmount: number;
}
