import { Injectable } from '@nestjs/common';
import { ActionType } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ActionHandler } from '../action-handler.interface';
import { ActionExecutionContext } from '../action-context.type';

@Injectable()
export class NotifyAdminHandler implements ActionHandler {
  readonly type = ActionType.NOTIFY_ADMIN;

  constructor(private readonly prisma: PrismaService) {}

  async execute(context: ActionExecutionContext): Promise<string> {
    // MVP: une notification admin est tracée dans AppLog.
    await this.prisma.appLog.create({
      data: {
        level: 'info',
        message: `Admin notified for workflow ${context.action.workflowId}`,
        context: context.payload as unknown as object,
      },
    });

    return 'admin notified';
  }
}
