import { IsString, IsNotEmpty } from 'class-validator';

export class BecomeHostDto {
  @IsString()
  @IsNotEmpty()
  bio: string;
}
