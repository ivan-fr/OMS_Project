import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateWorkflowDto {
  @ApiProperty({ example: 'Workflow onboarding client' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: true, required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
