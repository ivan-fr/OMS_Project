import { ActionType, WorkflowAction } from '@prisma/client';
import { BusinessEventPayloadDto } from '../../events/business-event-payload.dto';

export type ActionExecutionContext = {
  workflowExecutionId: string;
  action: WorkflowAction & { type: ActionType };
  payload: BusinessEventPayloadDto;
};
