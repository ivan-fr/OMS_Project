import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ActionType, WorkflowAction } from '@prisma/client';
import { BusinessEventPayloadDto } from '../../events/business-event-payload.dto';
import { ActionHandler } from './action-handler.interface';
import { CreateLogHandler } from './handlers/create-log.handler';
import { CreateTaskHandler } from './handlers/create-task.handler';
import { NotifyAdminHandler } from './handlers/notify-admin.handler';
import { NotifyUserHandler } from './handlers/notify-user.handler';
import { UpdateStatusHandler } from './handlers/update-status.handler';
import { CallWebhookHandler } from './handlers/call-webhook.handler';

@Injectable()
export class ActionExecutorService {
  private readonly handlersByType = new Map<ActionType, ActionHandler>();

  constructor(
    notifyAdminHandler: NotifyAdminHandler,
    notifyUserHandler: NotifyUserHandler,
    createLogHandler: CreateLogHandler,
    createTaskHandler: CreateTaskHandler,
    updateStatusHandler: UpdateStatusHandler,
    callWebhookHandler: CallWebhookHandler,
  ) {
    const handlers: ActionHandler[] = [
      notifyAdminHandler,
      notifyUserHandler,
      createLogHandler,
      createTaskHandler,
      updateStatusHandler,
      callWebhookHandler,
    ];

    // Enregistre chaque stratégie disponible.
    for (const handler of handlers) {
      this.handlersByType.set(handler.type, handler);
    }
  }

  async executeAction(
    workflowExecutionId: string,
    action: WorkflowAction,
    payload: BusinessEventPayloadDto,
  ): Promise<string> {
    const actionType = action.type as ActionType;
    const handler = this.resolveHandler(actionType);

    // Délègue au handler dédié.
    return handler.execute({
      workflowExecutionId,
      action: action as WorkflowAction & { type: ActionType },
      payload,
    });
  }

  async executeStandaloneAction(
    actionType: ActionType,
    payload: BusinessEventPayloadDto,
  ): Promise<string> {
    const handler = this.resolveHandler(actionType);

    // Action synthétique pour réutiliser les mêmes handlers.
    const standaloneAction = {
      id: 'standalone-action',
      workflowId: 'standalone-workflow',
      type: actionType,
      order: 0,
    } as WorkflowAction & { type: ActionType };

    return handler.execute({
      workflowExecutionId: 'standalone-execution',
      action: standaloneAction,
      payload,
    });
  }

  private resolveHandler(actionType: ActionType): ActionHandler {
    const handler = this.handlersByType.get(actionType);

    if (!handler) {
      throw new InternalServerErrorException(
        `No handler found for action type ${actionType}`,
      );
    }

    return handler;
  }
}
