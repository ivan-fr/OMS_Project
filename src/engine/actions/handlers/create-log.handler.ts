import { Injectable } from '@nestjs/common';
import { ActionType } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ActionHandler } from '../action-handler.interface';
import { ActionExecutionContext } from '../action-context.type';

@Injectable()
export class CreateLogHandler implements ActionHandler {
  readonly type = ActionType.CREATE_LOG;

  constructor(private readonly prisma: PrismaService) {}

  async execute(context: ActionExecutionContext): Promise<string> {
    // Crée une trace applicative de l'action.
    await this.prisma.appLog.create({
      data: {
        level: 'info',
        message: `Workflow action CREATE_LOG (${context.action.id})`,
        context: context.payload as unknown as object,
      },
    });

    return 'log created';
  }
}
