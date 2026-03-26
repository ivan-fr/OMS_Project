import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { TriggerType } from '@prisma/client';

export class CreateWorkflowDto {
  @ApiProperty({ example: 'Workflow onboarding client' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: true, required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: TriggerType.MANUAL_TRIGGER, required: false, enum: TriggerType })
  @IsOptional()
  @IsEnum(TriggerType)
  trigger?: TriggerType;

  @ApiProperty({ example: 'order.amount > 100', required: false })
  @IsOptional()
  @IsString()
  condition?: string;
}
