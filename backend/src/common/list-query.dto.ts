import { IsIn, IsOptional, IsString } from 'class-validator';

export class ListQueryDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() role?: string;
  @IsOptional() @IsString() search?: string; // name OR address (normal user store search)
  @IsOptional() @IsString() sortBy?: string;
  @IsOptional() @IsIn(['ASC', 'DESC', 'asc', 'desc']) order?: string;
}
