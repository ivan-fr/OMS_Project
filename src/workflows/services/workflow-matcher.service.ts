import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkflowMatcherService {
  private readonly logger = new Logger(WorkflowMatcherService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findMatchingWorkflows(eventType: string, userId?: string) {
    this.logger.debug(
      `Searching active workflows matching trigger="${eventType}" for userId="${userId ?? 'any'}"`,
    );

    const workflows = await this.prisma.workflow.findMany({
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
      },
    });

    this.logger.log(
      `Found ${workflows.length} matching workflow(s) for event "${eventType}" and user "${userId ?? 'any'}"`,
    );

    return workflows;
  }
}