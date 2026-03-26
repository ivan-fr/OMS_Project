import { IsEnum, IsObject, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BusinessEventPayloadDto } from './business-event-payload.dto';
import { TriggerType } from '@prisma/client';

export const BUSINESS_EVENT_TYPES = Object.values(TriggerType);

export type BusinessEventType = TriggerType;

export class BusinessEventDto {
  @ApiProperty({
    enum: TriggerType,
    example: TriggerType.MANUAL_TRIGGER,
  })
  @IsEnum(TriggerType)
  eventType: BusinessEventType;

  @ApiPropertyOptional({
    type: BusinessEventPayloadDto,
    example: { userId: '67e2ff0e8b4fa9d2e40aa111', email: 'user@example.com', orderId: 'order-1', amount: 120.5, status: 'created' },
  })
  @IsObject()
  @IsOptional()
  payload?: BusinessEventPayloadDto;
}
