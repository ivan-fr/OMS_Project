import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WorkflowMatcherService } from './workflow-matcher.service';

@Injectable()
export class EngineService {
  private readonly logger = new Logger(EngineService.name);

  constructor(private readonly matcher: WorkflowMatcherService) {}

  @OnEvent('*')
  async handleBusinessEvent(payload: { eventType: string; data: unknown }) {
    const { eventType, data } = payload;
    this.logger.log(`Event received: "${eventType}"`);

    const matchedWorkflows = await this.matcher.findMatchingWorkflows(eventType);

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

