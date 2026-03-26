import { Injectable, Logger } from '@nestjs/common';
import { WorkflowMatcherService } from '../workflows/services/workflow-matcher.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { BusinessEventDto } from '../events/business-event.dto';
import { BusinessEventPayloadDto } from '../events/business-event-payload.dto';
import { Prisma, TriggerType, Workflow, WorkflowAction,  } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EngineService {
  private readonly logger = new Logger(EngineService.name);

  constructor(
    private readonly matcher: WorkflowMatcherService,
    private readonly eventEmitter: EventEmitter2,
    private readonly prisma: PrismaService,
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
      // Simulation de l'exécution du workflow.
      await this.runWorkflow(workflow, data);
    }
  }

   private async runWorkflow(workflow: Workflow, data: BusinessEventPayloadDto) {
        // Logique pour exécuter les actions d'un workflow
        const workflowActions = await this.prisma.workflowAction.findMany({
            where: {
                workflowId: workflow.id,
            },
        });
        console.log(`Execution workflow avec L'ID : ${workflow.id}`);
        for (const action of workflowActions) {
            await this.runWorkflowAction(action);
        }
    }

    private async runWorkflowAction(action : WorkflowAction) {
        // Logique pour exécuter une action spécifique d'un workflow
        console.log(`Execution action avec L'ID : ${action.id} et type : ${action.type}`);
    }
}

