import { Injectable } from '@nestjs/common';
import { ActionType, Prisma, TriggerType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkflowDto } from '../workflows/dto/create-workflow.dto';
import { CreateActionDto } from '../workflows/dto/create-action.dto';

@Injectable()
export class WorkflowsRepository {
  constructor(private readonly prisma: PrismaService) {}

  createWorkflow(userId: string, dto: CreateWorkflowDto) {
    return this.prisma.workflow.create({
      data: {
        name: dto.name,
        isActive: dto.isActive ?? true,
        condition: dto.condition,
        userId,
        trigger: dto.trigger ?? TriggerType.MANUAL_TRIGGER,
      },
      select: {
        id: true,
        name: true,
        isActive: true,
        trigger: true,
        condition: true,
        userId: true,
        createdAt: true,
      },
    });
  }

  findAllByUser(userId: string) {
    return this.prisma.workflow.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findActiveByUser(userId: string) {
    return this.prisma.workflow.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByIdForUser(id: string, userId: string) {
    return this.prisma.workflow.findFirst({ where: { id, userId } });
  }

  updateTrigger(id: string, trigger: TriggerType) {
    return this.prisma.workflow.update({
      where: { id },
      data: { trigger },
    });
  }

  replaceActions(workflowId: string, body: CreateActionDto[]) {
    return this.prisma.workflow.update({
      where: { id: workflowId },
      data: {
        actions: {
          deleteMany: {},
          create: body.map((actionDto) => ({
            type: actionDto.type,
            config: actionDto.config,
            order: actionDto.order,
          })),
        },
      },
    });
  }

  findExecutionsByUser(userId: string) {
    return this.prisma.workflowExecution.findMany({
      where: { workflow: { userId } },
      orderBy: { startedAt: 'desc' },
      include: {
        workflow: { select: { id: true, name: true, trigger: true } },
        actionExecutions: {
          orderBy: { startedAt: 'asc' },
          select: {
            id: true,
            actionType: true,
            status: true,
            message: true,
            startedAt: true,
            finishedAt: true,
          },
        },
      },
      take: 50,
    });
  }

  findExecutionsByWorkflow(workflowId: string, userId: string) {
    return this.prisma.workflowExecution.findMany({
      where: { workflowId, workflow: { userId } },
      orderBy: { startedAt: 'desc' },
      include: {
        workflow: { select: { id: true, name: true, trigger: true } },
        actionExecutions: {
          orderBy: { startedAt: 'asc' },
          select: {
            id: true,
            actionType: true,
            status: true,
            message: true,
            startedAt: true,
            finishedAt: true,
          },
        },
      },
      take: 50,
    });
  }

  findMatchingActiveWorkflows(eventType: TriggerType, userId?: string) {
    return this.prisma.workflow.findMany({
      where: {
        trigger: eventType,
        isActive: true,
        ...(userId ? { userId } : {}),
      },
      select: {
        id: true,
        name: true,
        trigger: true,
        isActive: true,
        condition: true,
        userId: true,
        createdAt: true,
      },
    });
  }

  findActionsByWorkflowOrdered(workflowId: string) {
    return this.prisma.workflowAction.findMany({
      where: { workflowId },
      orderBy: { order: 'asc' },
    });
  }

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
