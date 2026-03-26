import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BusinessEventPayloadDto } from '../events/business-event-payload.dto';
import { TriggerType } from '@prisma/client';
import { OrdersRepository } from '../repositories/orders.repository';
@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateOrderDto, userId: string) {
    const order = await this.ordersRepository.createOrder({
      amount: dto.amount,
      status: 'created',
      userId,
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
    return this.ordersRepository.findByUser(userId);
  }
}