import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BusinessEventPayloadDto } from 'src/events/business-event-payload.dto';
import { TriggerType } from '@prisma/client';
@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService, private readonly eventEmitter: EventEmitter2,) {}

  async create(dto: CreateOrderDto, userId: string) {
    const order = await this.prisma.order.create({
      data: {
        amount: dto.amount,
        status: 'created',
        userId,
      },
    });

        // Émet l'événement métier pour déclencher les workflows.
    this.eventEmitter.emit(TriggerType.ORDER_CREATED, {
      eventType: TriggerType.ORDER_CREATED,
      data: {
        orderId: order.id,
        amount: order.amount,
        userId: order.userId,
      } as BusinessEventPayloadDto,
    });

    return order;
  }

  async findByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}