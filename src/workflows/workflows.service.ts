import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { BUSINESS_EVENT_TYPES } from '../events/business-event.dto';
import { TriggerType } from '@prisma/client';
import { CreateActionDto } from './dto/create-action.dto';

@Injectable()
export class WorkflowsService {
	constructor(private readonly prisma: PrismaService) {}

    async addActionToWorkflow(
      workflowId: string,
      userId: string,
      body: CreateActionDto[],
    ) {
      // Vérifie ownership + existence pour éviter la fuite de données.
      const workflow = await this.getWorkflowById(workflowId, userId);

      if (!workflow) {
        throw new NotFoundException('Workflow not found');
      }

      if (!workflow.isActive) {
        throw new BadRequestException('Workflow is not active');
      }

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

	create(userId: string, dto: CreateWorkflowDto) {
		return this.prisma.workflow.create({
			data: {
				name: dto.name,
				isActive: dto.isActive ?? true,
				condition: dto.condition,
				userId,
				// Trigger par défaut si non fourni.
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

  getAllowedTriggers(): TriggerType[] {
    return [...BUSINESS_EVENT_TYPES] as TriggerType[];
  }

  async getWorkflowById(id: string, userId: string) {
    return this.prisma.workflow.findFirst({ where: { id, userId } });
  }

  async updateWorkflow(id: string, _userId: string, trigger: TriggerType) {
    // Le contrôle de propriété est déjà fait côté controller via getWorkflowById.
    return this.prisma.workflow.update({
      where: { id },
      data: { trigger },
    });
  }

  async assignTriggerToWorkflow(
    workflowId: string,
    userId: string,
    trigger: TriggerType,
  ) {
    // Vérifie ownership + existence pour éviter la fuite de données.
    const workflow = await this.getWorkflowById(workflowId, userId);

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    if (!workflow.isActive) {
      throw new BadRequestException('Workflow is not active');
    }

    return this.updateWorkflow(workflowId, userId, trigger);
  }
}
