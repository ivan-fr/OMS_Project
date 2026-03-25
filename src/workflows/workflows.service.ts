import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessEventType, BUSINESS_EVENT_TYPES } from '../events/business-event.dto';

export class CreateWorkflowDto {
  name: string;
  trigger: BusinessEventType;
  userId: string;
  isActive?: boolean;
  condition?: string;
}

@Injectable()
export class WorkflowsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateWorkflowDto) {
    return this.prisma.workflow.create({
      data: {
        name: dto.name,
        trigger: dto.trigger,
        userId: dto.userId,
        isActive: dto.isActive ?? true,
        condition: dto.condition,
      },
    });
  }

  findAll() {
    return this.prisma.workflow.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findActive() {
    return this.prisma.workflow.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  getAllowedTriggers(): string[] {
    return [...BUSINESS_EVENT_TYPES];
  }
}

