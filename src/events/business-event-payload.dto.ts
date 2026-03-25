import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BusinessEventPayloadDto {
  @ApiProperty({ example: '67e2ff0e8b4fa9d2e40aa111' })
  userId: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  email?: string;

  @ApiPropertyOptional({ example: '67e2ff0e8b4fa9d2e40bb222' })
  orderId?: string;

  @ApiPropertyOptional({ example: 120.5 })
  amount?: number;

  @ApiPropertyOptional({ example: 'created' })
  status?: string;
}
