import { IsEmail, IsInt, IsNotEmpty, IsOptional, Length, Max, MaxLength, Min } from 'class-validator';

export class CreateStoreDto {
  @Length(20, 60, { message: 'Store name must be between 20 and 60 characters' })
  name: string;

  @IsEmail({}, { message: 'Email is not valid' })
  email: string;

  @IsNotEmpty({ message: 'Address is required' })
  @MaxLength(400, { message: 'Address can be at most 400 characters' })
  address: string;

  @IsOptional()
  @IsInt()
  ownerId?: number;
}

export class RateStoreDto {
  @IsInt({ message: 'Rating must be a whole number' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  value: number;
}
