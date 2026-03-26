import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;

  const ordersServiceMock = {
    create: jest.fn(),
    findByUser: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new OrdersController(
      ordersServiceMock as unknown as OrdersService,
    );
  });

  it('create: délègue au service avec dto et userId', async () => {
    ordersServiceMock.create.mockResolvedValue({
      id: 'o1',
      amount: 100,
      status: 'created',
    });

    const dto = { amount: 100 };
    const req = { user: { sub: 'u1', email: 'john@doe.com' } };

    const result = await controller.create(dto as any, req as any);

    expect(ordersServiceMock.create).toHaveBeenCalledWith(dto, 'u1');
    expect(result.status).toBe('created');
  });

  it('findMyOrders: retourne les commandes de l’utilisateur', async () => {
    ordersServiceMock.findByUser.mockResolvedValue([
      { id: 'o1', amount: 100 },
    ]);

    const req = { user: { sub: 'u1', email: 'john@doe.com' } };

    const result = await controller.findMyOrders(req as any);

    expect(ordersServiceMock.findByUser).toHaveBeenCalledWith('u1');
    expect(result.length).toBe(1);
  });
});