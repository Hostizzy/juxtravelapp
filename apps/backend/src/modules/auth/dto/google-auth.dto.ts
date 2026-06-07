import { IsString, IsNotEmpty } 
  from 'class-validator';

export class GoogleAuthDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
