import { IsNotEmpty, IsUUID } from 'class-validator';

export class SavePropertyDto {
  @IsUUID()
  @IsNotEmpty()
  propertyId: string;
}
