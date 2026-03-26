import { Injectable } from '@nestjs/common';
import { ActionType } from '@prisma/client';
import { ActionHandler } from '../action-handler.interface';
import { ActionExecutionContext } from '../action-context.type';
import { AppLogHelperService } from '../../../appLog/app-log-helper.service';

@Injectable()
export class NotifyUserHandler implements ActionHandler {
  readonly type = ActionType.NOTIFY_USER;

  constructor(private readonly appLogHelper: AppLogHelperService) {}

  async execute(context: ActionExecutionContext): Promise<string> {
    // MVP: on trace la notification utilisateur.
    await this.appLogHelper.info(
      `User notified (${context.payload.userId})`,
      context.payload as unknown as Record<string, unknown>,
    );

    return 'user notified';
  }
}
