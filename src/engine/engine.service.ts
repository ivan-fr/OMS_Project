import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WorkflowMatcherService } from '../workflows/services/workflow-matcher.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BusinessEventDto } from '../events/business-event.dto';
import { BusinessEventPayloadDto } from '../events/business-event-payload.dto';

@Injectable()
export class EngineService {
  private readonly logger = new Logger(EngineService.name);

  constructor(
    private readonly matcher: WorkflowMatcherService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async receiveEvent(userId: string, dto: BusinessEventDto) {
    const matchedWorkflows = await this.matcher.findMatchingWorkflows(
      dto.eventType,
      userId,
    );

    // On injecte toujours le user du token.
    const payload: BusinessEventPayloadDto = {
      ...(dto.payload ?? {}),
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
    eventType: string;
    data: BusinessEventPayloadDto;
  }) {
    const { eventType, data } = payload;
    this.logger.log(`Event received: "${eventType}"`);

    // On limite la recherche au propriétaire quand possible.
    const matchedWorkflows = await this.matcher.findMatchingWorkflows(
      eventType,
      data.userId,
    );

    if (matchedWorkflows.length === 0) {
      this.logger.warn(`No active workflow found for event "${eventType}"`);
      return;
    }

    for (const workflow of matchedWorkflows) {
      this.logger.log(
        `Triggering workflow "${workflow.name}" (id: ${workflow.id}) for event "${eventType}"`,
      );
      void data;
    }
  }
}

