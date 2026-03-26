import { Injectable, Logger } from '@nestjs/common';
import { TriggerType } from '@prisma/client';
import { WorkflowsRepository } from '../../repositories/workflows.repository';

@Injectable()
export class WorkflowMatcherService {
  private readonly logger = new Logger(WorkflowMatcherService.name);

  constructor(private readonly workflowsRepository: WorkflowsRepository) {}

  async findMatchingWorkflows(eventType: TriggerType, userId?: string) {
    this.logger.debug(
      `Searching active workflows matching trigger="${eventType}" for userId="${userId ?? 'Unspecified'}"`,
    );

    const workflows = await this.workflowsRepository.findMatchingActiveWorkflows(
      eventType,
      userId,
    );

    this.logger.log(
      `Found ${workflows.length} matching workflow(s) for event "${eventType}" and user "${userId ?? 'Unspecified'}"`,
    );

    return workflows;
  }
}