import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TriggerType } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersRepository } from '../repositories/orders.repository';

describe('OrdersService', () => {
  let service: OrdersService;

  const ordersRepositoryMock = {
    createOrder: jest.fn(),
    findByUser: jest.fn(),
  };

  const eventEmitterMock = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: OrdersRepository, useValue: ordersRepositoryMock },
        { provide: EventEmitter2, useValue: eventEmitterMock },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('create: crée une commande + émet ORDER_CREATED', async () => {
    const mockOrder = {
      id: 'o1',
      amount: 100,
      status: 'created',
      userId: 'u1',
    };

    ordersRepositoryMock.createOrder.mockResolvedValue(mockOrder);

    const dto: CreateOrderDto = { amount: 100 };
    const userId = 'u1';

    const result = await service.create(dto, userId);

    expect(ordersRepositoryMock.createOrder).toHaveBeenCalledWith({
        amount: dto.amount,
        status: 'created',
        userId,
    });

    expect(eventEmitterMock.emit).toHaveBeenCalledWith(
      TriggerType.ORDER_CREATED,
      {
        eventType: TriggerType.ORDER_CREATED,
        data: {
          orderId: mockOrder.id,
          amount: mockOrder.amount,
          userId: mockOrder.userId,
        },
      },
    );

    expect(result).toEqual(mockOrder);
  });

  it('findByUser: retourne les commandes triées', async () => {
    const mockOrders = [
      { id: 'o2', amount: 200, userId: 'u1' },
      { id: 'o1', amount: 100, userId: 'u1' },
    ];

    ordersRepositoryMock.findByUser.mockResolvedValue(mockOrders);

    const result = await service.findByUser('u1');

    expect(ordersRepositoryMock.findByUser).toHaveBeenCalledWith('u1');

    expect(result).toEqual(mockOrders);
  });
});