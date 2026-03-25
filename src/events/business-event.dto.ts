import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BusinessEventPayloadDto } from './business-event-payload.dto';

export const BUSINESS_EVENT_TYPES = [
  'user.registered',
  'order.created',
  'manual.trigger',
] as const;

export enum BusinessEventTypesEnum {
  USER_REGISTERED = 'user.registered',
  ORDER_CREATED = 'order.created',
  MANUAL_TRIGGER = 'manual.trigger',
}

export type BusinessEventType = (typeof BUSINESS_EVENT_TYPES)[number];

export class BusinessEventDto {
  @ApiProperty({
    enum: BUSINESS_EVENT_TYPES,
    example: 'manual.trigger',
  })
  @IsString()
  @IsIn(BUSINESS_EVENT_TYPES)
  eventType: BusinessEventType;

  @ApiPropertyOptional({
    type: BusinessEventPayloadDto,
    example: { userId: '67e2ff0e8b4fa9d2e40aa111', email: 'user@example.com', orderId: 'order-1', amount: 120.5, status: 'created' },
  })
  @IsObject()
  @IsOptional()
  payload?: BusinessEventPayloadDto;
}
