import { IsString, IsOptional, IsIn, IsObject } from 'class-validator';

export class CreateAppLogDto {
  @IsString()
  @IsIn(['info', 'warning', 'error'])
  level: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  context?: Record<string, unknown>;
}