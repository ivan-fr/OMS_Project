import { BadRequestException, Injectable } from '@nestjs/common';
import { ActionType } from '@prisma/client';
import { ActionHandler } from '../action-handler.interface';
import { ActionExecutionContext } from '../action-context.type';
import { OrdersRepository } from '../../../repositories/orders.repository';

@Injectable()
export class UpdateStatusHandler implements ActionHandler {
  readonly type = ActionType.UPDATE_STATUS;

  constructor(private readonly ordersRepository: OrdersRepository) {}

  async execute(context: ActionExecutionContext): Promise<string> {
    // Requiert une commande cible.
    if (!context.payload.orderId) {
      throw new BadRequestException('orderId is required for UPDATE_STATUS');
    }

    const rawConfig = (context.action.config ?? {}) as { newStatus?: string };
    const newStatus = rawConfig.newStatus ?? 'processing';

    await this.ordersRepository.updateStatus(context.payload.orderId, newStatus);

    return `order status updated to ${newStatus}`;
  }
}
