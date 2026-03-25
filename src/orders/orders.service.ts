import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';

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

    this.eventEmitter.emit('order.created', {
      eventType: 'order.created',
      data: { orderId: order.id, amount: order.amount, userId: order.userId },
    });

    return order;
  }

  findAll() {
    return this.prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
  }
}

