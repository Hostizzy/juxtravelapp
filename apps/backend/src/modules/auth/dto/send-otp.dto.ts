import { IsString, IsNotEmpty, Matches }
  from 'class-validator';

export class SendOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+91[0-9]{10}$/, {
    message: 'Phone must be +91XXXXXXXXXX format'
  })
  phone: string;
}
