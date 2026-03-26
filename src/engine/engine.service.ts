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
import { WorkflowConditionService } from './services/workflow-condition.service';
import { AppLogHelperService } from '../appLog/app-log-helper.service';

@Injectable()
export class EngineService {
  private readonly logger = new Logger(EngineService.name);

  constructor(
    private readonly matcher: WorkflowMatcherService,
    private readonly eventEmitter: EventEmitter2,
    private readonly prisma: PrismaService,
    private readonly actionExecutor: ActionExecutorService,
    private readonly workflowConditionService: WorkflowConditionService,
    private readonly appLogHelper: AppLogHelperService,
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
    await this.appLogHelper.info(`Event received: "${eventType}"`, {
      eventType,
      userId: data.userId,
      payload: data,
    });



    if(eventType !== TriggerType.ORDER_NUM){

    // On limite la recherche au propriétaire pour éviter les fuites inter-users.
    const matchedWorkflows = await this.matcher.findMatchingWorkflows(
      eventType,
      data.userId,
    );

    if (matchedWorkflows.length === 0) {
      this.logger.warn(`No active workflow found for event "${eventType}"`);
      await this.appLogHelper.warning(
        `No active workflow found for event "${eventType}"`,
        {
          eventType,
          userId: data.userId,
        },
      );
      return;
    }

    for (const workflow of matchedWorkflows) {
      const conditionMatched = this.workflowConditionService.evaluate(
        workflow.condition,
        data,
      );

      if (!conditionMatched) {
        this.logger.log(
          `Workflow ${workflow.id} ignored: condition not satisfied`,
        );
        await this.appLogHelper.info(
          `Workflow ${workflow.id} ignored: condition not satisfied`,
          {
            workflowId: workflow.id,
            condition: workflow.condition,
            eventType,
            userId: data.userId,
          },
        );
        continue;
      }

      // Orchestration workflow par workflow.
      await this.runWorkflow(workflow, data);
    }
    }else{
      // Cas BONUS pour ORDER_NUM: on veut enregistrer dans les log le nombre total de commandes déjà payées périodiquement.
      const orderCount = await this.prisma.order.count({
        where: { status: 'paid' },
      });
   
      await this.appLogHelper.info(`Total de commandes déjà payées est : ${orderCount}`, {
        eventType,
        userId: payload.data.userId,
        orderCount,
      });
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
    await this.appLogHelper.info(`Starting workflow execution: ${workflow.id}`, {
      workflowId: workflow.id,
      trigger: workflow.trigger,
      userId: data.userId,
      workflowExecutionId: execution.id,
    });

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
      await this.appLogHelper.info(
        `Workflow ${workflow.id} executed with success`,
        {
          workflowId: workflow.id,
          workflowExecutionId: execution.id,
          userId: data.userId,
        },
      );
    } catch (error) {
      // Si une action échoue, le workflow passe en erreur.
      await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: { status: 'error', finishedAt: new Date() },
      });

      const stackOrMessage =
        error instanceof Error ? error.stack ?? error.message : String(error);
      this.logger.error(`Workflow ${workflow.id} failed`, stackOrMessage);
      await this.appLogHelper.error(`Workflow ${workflow.id} failed`, {
        workflowId: workflow.id,
        workflowExecutionId: execution.id,
        userId: data.userId,
        error: stackOrMessage,
      });
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
    await this.appLogHelper.info(`Starting action: ${action.type}`, {
      workflowExecutionId,
      actionExecutionId: actionExecution.id,
      actionType: action.type,
      workflowId: action.workflowId,
      userId: data.userId,
    });

    try {
      const result = await this.actionExecutor.executeAction(
        workflowExecutionId,
        action,
        data,
      );

      this.logger.log(`Action ${action.type} succeeded`);
      await this.appLogHelper.info(`Action ${action.type} succeeded`, {
        workflowExecutionId,
        actionExecutionId: actionExecution.id,
        actionType: action.type,
        workflowId: action.workflowId,
        userId: data.userId,
        result,
      });

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
      await this.appLogHelper.error(`Action ${action.type} failed`, {
        workflowExecutionId,
        actionExecutionId: actionExecution.id,
        actionType: action.type,
        workflowId: action.workflowId,
        userId: data.userId,
        error: String(error),
      });

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

