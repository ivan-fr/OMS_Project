import { ActionType } from '@prisma/client';
import { ActionExecutionContext } from './action-context.type';

// Contrat unique pour toutes les actions (pattern Strategy).
export interface ActionHandler {
  readonly type: ActionType;
  execute(context: ActionExecutionContext): Promise<string>;
}
