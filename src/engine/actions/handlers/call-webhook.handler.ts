import { Injectable, Logger } from '@nestjs/common';
import { ActionType } from '@prisma/client';
import { ActionHandler } from '../action-handler.interface';
import { ActionExecutionContext } from '../action-context.type';

@Injectable()
export class CallWebhookHandler implements ActionHandler {
  readonly type = ActionType.CALL_WEBHOOK;
  private readonly logger = new Logger(CallWebhookHandler.name);

  async execute(context: ActionExecutionContext): Promise<string> {
    const config = context.action.config as Record<string, unknown> | null;
    const url = config?.url as string | undefined;

    if (!url) {
      throw new Error('Missing "url" in action config');
    }

    const body = {
      workflowExecutionId: context.workflowExecutionId,
      actionType: context.action.type,
      payload: context.payload,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const status = response.status;
    const responseBody = await response.text();

    this.logger.log(`Webhook ${url} responded with status ${status}`);

    if (!response.ok) {
      throw new Error(`Webhook failed with status ${status}: ${responseBody}`);
    }

    return `webhook called: ${status}`;
  }
}
