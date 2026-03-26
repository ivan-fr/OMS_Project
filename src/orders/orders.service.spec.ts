import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TriggerType } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';

describe('OrdersService', () => {
  let service: OrdersService;

  const prismaMock = {
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const eventEmitterMock = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prismaMock },
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

    prismaMock.order.create.mockResolvedValue(mockOrder);

    const dto: CreateOrderDto = { amount: 100 };
    const userId = 'u1';

    const result = await service.create(dto, userId);

    expect(prismaMock.order.create).toHaveBeenCalledWith({
      data: {
        amount: dto.amount,
        status: 'created',
        userId,
      },
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

    prismaMock.order.findMany.mockResolvedValue(mockOrders);

    const result = await service.findByUser('u1');

    expect(prismaMock.order.findMany).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      orderBy: { createdAt: 'desc' },
    });

    expect(result).toEqual(mockOrders);
  });
});