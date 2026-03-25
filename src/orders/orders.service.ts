import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessEventTypesEnum } from 'src/events/business-event.dto';
import { BusinessEventPayloadDto } from 'src/events/business-event-payload.dto';

type CreateOrderInput = {
  amount: number;
  userId: string;
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(input: CreateOrderInput) {
    const order = await this.prisma.order.create({
      data: {
        amount: input.amount,
        status: 'created',
        userId: input.userId,
      },
    });

    this.eventEmitter.emit(BusinessEventTypesEnum.ORDER_CREATED, {
      eventType: BusinessEventTypesEnum.ORDER_CREATED,
      data: {
        orderId: order.id,
        amount: order.amount,
        userId: order.userId,
      } as BusinessEventPayloadDto,
    });

    return order;
  }

  findAll(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

