import { IsString, IsOptional }
  from 'class-validator';

export class BecomeHostDto {
  @IsOptional()
  @IsString()
  bio?: string;
}
