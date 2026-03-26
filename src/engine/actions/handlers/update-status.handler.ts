import { BadRequestException, Injectable } from '@nestjs/common';
import { ActionType } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ActionHandler } from '../action-handler.interface';
import { ActionExecutionContext } from '../action-context.type';

@Injectable()
export class UpdateStatusHandler implements ActionHandler {
  readonly type = ActionType.UPDATE_STATUS;

  constructor(private readonly prisma: PrismaService) {}

  async execute(context: ActionExecutionContext): Promise<string> {
    // Requiert une commande cible.
    if (!context.payload.orderId) {
      throw new BadRequestException('orderId is required for UPDATE_STATUS');
    }

    const rawConfig = (context.action.config ?? {}) as { newStatus?: string };
    const newStatus = rawConfig.newStatus ?? 'processing';

    await this.prisma.order.update({
      where: { id: context.payload.orderId },
      data: { status: newStatus },
    });

    return `order status updated to ${newStatus}`;
  }
}
