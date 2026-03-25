import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { BUSINESS_EVENT_TYPES} from '../../events/business-event.dto';
import type { BusinessEventType } from '../../events/business-event.dto';

export class CreateWorkflowDto {
  @ApiProperty({ example: 'Workflow onboarding client' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: true, required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 'manual.trigger', required: false })
  @IsOptional()
  @IsIn(BUSINESS_EVENT_TYPES)
  trigger?: BusinessEventType;

  @ApiProperty({ example: 'order.amount > 100', required: false })
  @IsOptional()
  @IsString()
  condition?: string;
}
