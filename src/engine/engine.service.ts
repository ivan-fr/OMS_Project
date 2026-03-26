import { Injectable, Logger } from '@nestjs/common';
import { WorkflowMatcherService } from '../workflows/services/workflow-matcher.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { BusinessEventDto } from '../events/business-event.dto';
import { BusinessEventPayloadDto } from '../events/business-event-payload.dto';
import {
  ActionType,
  Prisma,
  TriggerType,
  Workflow,
  WorkflowAction,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActionExecutorService } from './actions/action-executor.service';

@Injectable()
export class EngineService {
  private readonly logger = new Logger(EngineService.name);

  constructor(
    private readonly matcher: WorkflowMatcherService,
    private readonly eventEmitter: EventEmitter2,
    private readonly prisma: PrismaService,
    private readonly actionExecutor: ActionExecutorService,
  ) {}

  async receiveEvent(userId: string, dto: BusinessEventDto) {
    const matchedWorkflows = await this.matcher.findMatchingWorkflows(
      dto.eventType,
      userId,
    );

    const basePayload = dto.payload ?? {};

    // On injecte toujours le user du token.
    const payload: BusinessEventPayloadDto = {
      ...basePayload,
      userId,
    };

    // Publie l'événement dans le bus interne Nest.
    this.eventEmitter.emit(dto.eventType, {
      eventType: dto.eventType,
      data: payload,
    });

    return {
      eventType: dto.eventType,
      matchedWorkflows,
      triggeredAt: new Date().toISOString(),
    };
  }

  @OnEvent('*')
  async handleBusinessEvent(payload: {
    eventType: TriggerType;
    data: BusinessEventPayloadDto;
  }) {
    const { eventType, data } = payload;
    this.logger.log(`Event received: "${eventType}"`);

    // On limite la recherche au propriétaire pour éviter les fuites inter-users.
    const matchedWorkflows = await this.matcher.findMatchingWorkflows(
      eventType,
      data.userId,
    );

    if (matchedWorkflows.length === 0) {
      this.logger.warn(`No active workflow found for event "${eventType}"`);
      return;
    }

    for (const workflow of matchedWorkflows) {
      // Orchestration workflow par workflow.
      await this.runWorkflow(workflow, data);
    }
  }

  private async runWorkflow(workflow: Workflow, data: BusinessEventPayloadDto) {
    // Trace globale de l'exécution du workflow.
    const execution = await this.prisma.workflowExecution.create({
      data: {
        workflowId: workflow.id,
        eventType: workflow.trigger,
        status: 'running',
        payload: data as unknown as Prisma.InputJsonValue,
      },
    });

    this.logger.log(`Starting workflow execution: ${workflow.id}`);

    try {
      // Exécution séquentielle des actions (order ASC).
      const workflowActions = await this.prisma.workflowAction.findMany({
        where: { workflowId: workflow.id },
        orderBy: { order: 'asc' },
      });

      for (const action of workflowActions) {
        await this.runWorkflowAction(execution.id, action, data);
      }

      await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: { status: 'success', finishedAt: new Date() },
      });

      this.logger.log(`Workflow ${workflow.id} executed with success`);
    } catch (error) {
      // Si une action échoue, le workflow passe en erreur.
      await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: { status: 'error', finishedAt: new Date() },
      });

      const stackOrMessage =
        error instanceof Error ? error.stack ?? error.message : String(error);
      this.logger.error(`Workflow ${workflow.id} failed`, stackOrMessage);
    }
  }

  private async runWorkflowAction(
    workflowExecutionId: string,
    action: WorkflowAction,
    data: BusinessEventPayloadDto,
  ) {
    // Trace granulaire: une ligne par action.
    const actionExecution = await this.prisma.actionExecution.create({
      data: {
        workflowExecutionId,
        actionType: action.type as ActionType,
        status: 'running',
      },
    });

    this.logger.log(`Starting action: ${action.type}`);

    try {
      const result = await this.actionExecutor.executeAction(
        workflowExecutionId,
        action,
        data,
      );

      this.logger.log(`Action ${action.type} succeeded`);

      await this.prisma.actionExecution.update({
        where: { id: actionExecution.id },
        data: {
          status: 'success',
          message: result,
          finishedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Action ${action.type} failed`, String(error));

      await this.prisma.actionExecution.update({
        where: { id: actionExecution.id },
        data: {
          status: 'error',
          message: String(error),
          finishedAt: new Date(),
        },
      });

      // On remonte l'erreur pour marquer le workflow en échec.
      throw error;
    }
  }
}

