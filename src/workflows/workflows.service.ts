import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { BUSINESS_EVENT_TYPES, BusinessEventTypesEnum } from '../events/business-event.dto';
import { Workflow } from '@prisma/client';
import { TriggerType } from '@prisma/client';

@Injectable()
export class WorkflowsService {
	constructor(private readonly prisma: PrismaService) {}

	create(userId: string, dto: CreateWorkflowDto) {
		return this.prisma.workflow.create({
			data: {
				name: dto.name,
				isActive: dto.isActive ?? true,
        condition: dto.condition,
				userId,
        // Trigger par défaut si non fourni.
        trigger: dto.trigger ?? BusinessEventTypesEnum.MANUAL_TRIGGER
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

  findAll(userId: string) {
    return this.prisma.workflow.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findActive(userId: string) {
    return this.prisma.workflow.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  getAllowedTriggers(): string[] {
    return [...BUSINESS_EVENT_TYPES];
  }
      async getWorkflowById(id: string) {
          return this.prisma.workflow.findUnique({ where: { id } });
      }

      async updateWorkflow(id: string, data: any) {
          return this.prisma.workflow.update({ where: { id }, data: data });
      }
}
