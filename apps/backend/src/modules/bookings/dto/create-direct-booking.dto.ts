import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateDirectBookingDto {
  @IsUUID()
  @IsNotEmpty()
  propertyId: string;

  @IsDateString()
  @IsNotEmpty()
  checkIn: string;

  @IsDateString()
  @IsNotEmpty()
  checkOut: string;

  @IsInt()
  @Min(1)
  guests: number;

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsOptional()
  @IsIn(['pending', 'confirmed'])
  status?: 'pending' | 'confirmed';

  @IsOptional()
  @IsString()
  paymentId?: string;
}
