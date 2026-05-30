import { 
  IsString, 
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export enum UserRole {
  GUEST = 'guest',
  HOST = 'host',
  BOTH = 'both',
}

export class CreateUserDto {
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
