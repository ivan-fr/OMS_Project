import { IsEnum } from 'class-validator';
import { TriggerType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTriggerDto {
    @ApiProperty({ enum: TriggerType, example: TriggerType.ORDER_CREATED })
    @IsEnum(TriggerType)
    trigger: TriggerType;
}