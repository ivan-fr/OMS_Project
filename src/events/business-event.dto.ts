import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';

export const BUSINESS_EVENT_TYPES = [
  'user.registered',
  'order.created',
  'manual.trigger',
] as const;

export type BusinessEventType = (typeof BUSINESS_EVENT_TYPES)[number];

export class BusinessEventDto {
  @IsString()
  @IsIn(BUSINESS_EVENT_TYPES)
  eventType: BusinessEventType;

  @IsObject()
  @IsOptional()
  payload?: Record<string, unknown>;
}
