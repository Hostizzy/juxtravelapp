import { 
  IsString, 
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class VerifyTokenDto {
  @IsString()
  @IsNotEmpty()
  idToken: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  email?: string;
}
