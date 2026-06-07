import { IsString, IsNotEmpty, Matches, 
  Length } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+91[0-9]{10}$/, {
    message: 'Phone must be +91XXXXXXXXXX format'
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { 
    message: 'OTP must be 6 digits' 
  })
  otp: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
