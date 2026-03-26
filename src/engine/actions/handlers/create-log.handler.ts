import { Injectable } from '@nestjs/common';
import { ActionType } from '@prisma/client';
import { ActionHandler } from '../action-handler.interface';
import { ActionExecutionContext } from '../action-context.type';
import { AppLogHelperService } from '../../../appLog/app-log-helper.service';

@Injectable()
export class CreateLogHandler implements ActionHandler {
  readonly type = ActionType.CREATE_LOG;

  constructor(private readonly appLogHelper: AppLogHelperService) {}

  async execute(context: ActionExecutionContext): Promise<string> {
    // Crée une trace applicative de l'action.
    await this.appLogHelper.info(
      `Workflow action CREATE_LOG (${context.action.id})`,
      context.payload as unknown as Record<string, unknown>,
    );

    return 'log created';
  }
}
