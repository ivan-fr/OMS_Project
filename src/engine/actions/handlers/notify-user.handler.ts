import { Injectable } from '@nestjs/common';
import { ActionType } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ActionHandler } from '../action-handler.interface';
import { ActionExecutionContext } from '../action-context.type';

@Injectable()
export class NotifyUserHandler implements ActionHandler {
  readonly type = ActionType.NOTIFY_USER;

  constructor(private readonly prisma: PrismaService) {}

  async execute(context: ActionExecutionContext): Promise<string> {
    // MVP: on trace la notification utilisateur.
    await this.prisma.appLog.create({
      data: {
        level: 'info',
        message: `User notified (${context.payload.userId})`,
        context: context.payload as unknown as object,
      },
    });

    return 'user notified';
  }
}
