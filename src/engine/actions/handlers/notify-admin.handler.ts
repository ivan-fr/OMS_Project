import { Injectable } from '@nestjs/common';
import { ActionType } from '@prisma/client';
import { ActionHandler } from '../action-handler.interface';
import { ActionExecutionContext } from '../action-context.type';
import { AppLogHelperService } from '../../../appLog/app-log-helper.service';

@Injectable()
export class NotifyAdminHandler implements ActionHandler {
  readonly type = ActionType.NOTIFY_ADMIN;

  constructor(private readonly appLogHelper: AppLogHelperService) {}

  async execute(context: ActionExecutionContext): Promise<string> {
    // MVP: une notification admin est tracée dans AppLog.
    await this.appLogHelper.info(
      `Admin notified for workflow ${context.action.workflowId}`,
      context.payload as unknown as Record<string, unknown>,
    );

    return 'admin notified';
  }
}
