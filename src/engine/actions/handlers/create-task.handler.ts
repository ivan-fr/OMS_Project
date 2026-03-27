import { Injectable } from '@nestjs/common';
import { ActionType } from '@prisma/client';
import { ActionHandler } from '../action-handler.interface';
import { ActionExecutionContext } from '../action-context.type';
import { TasksRepository } from '../../../repositories/tasks.repository';

@Injectable()
export class CreateTaskHandler implements ActionHandler {
  readonly type = ActionType.CREATE_TASK_DB;

  constructor(private readonly tasksRepository: TasksRepository) {}

  async execute(context: ActionExecutionContext): Promise<string> {
    // Crée une tâche liée à l'utilisateur (et à la commande si disponible).
    if(!context.payload.userId || !context.payload.orderId) {
      throw new Error('userId and orderId are required for CREATE_TASK_DB');
    }
    await this.tasksRepository.createWorkflowTask({
      userId: context.payload.userId,
      ...(context.payload.orderId ? { orderId: context.payload.orderId } : {}),
    });

    return 'task created';
  }
}
