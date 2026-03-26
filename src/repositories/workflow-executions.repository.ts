import { Injectable } from '@nestjs/common';
import { ActionType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkflowExecutionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  createWorkflowExecution(data: {
    workflowId: string;
    eventType: string;
    payload: Prisma.InputJsonValue;
  }) {
    return this.prisma.workflowExecution.create({
      data: {
        workflowId: data.workflowId,
        eventType: data.eventType,
        status: 'running',
        payload: data.payload,
      },
    });
  }

  updateWorkflowExecutionStatus(
    executionId: string,
    status: 'success' | 'error',
  ) {
    return this.prisma.workflowExecution.update({
      where: { id: executionId },
      data: { status, finishedAt: new Date() },
    });
  }

  createActionExecution(workflowExecutionId: string, actionType: ActionType) {
    return this.prisma.actionExecution.create({
      data: {
        workflowExecutionId,
        actionType,
        status: 'running',
      },
    });
  }

  updateActionExecutionStatus(data: {
    actionExecutionId: string;
    status: 'success' | 'error';
    message?: string;
  }) {
    return this.prisma.actionExecution.update({
      where: { id: data.actionExecutionId },
      data: {
        status: data.status,
        message: data.message,
        finishedAt: new Date(),
      },
    });
  }
}
