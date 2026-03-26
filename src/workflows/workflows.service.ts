import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { BUSINESS_EVENT_TYPES } from '../events/business-event.dto';
import { TriggerType } from '@prisma/client';
import { CreateActionDto } from './dto/create-action.dto';
import { WorkflowsRepository } from '../repositories/workflows.repository';

@Injectable()
export class WorkflowsService {
	constructor(private readonly workflowsRepository: WorkflowsRepository) {}

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

      return this.workflowsRepository.replaceActions(workflowId, body);
    }

	create(userId: string, dto: CreateWorkflowDto) {
		return this.workflowsRepository.createWorkflow(userId, dto);
	}

  findAll(userId: string) {
    return this.workflowsRepository.findAllByUser(userId);
  }

  findActive(userId: string) {
    return this.workflowsRepository.findActiveByUser(userId);
  }

  findExecutions(userId: string) {
    return this.workflowsRepository.findExecutionsByUser(userId);
  }

  async findActionsByWorkflow(workflowId: string, userId: string) {
    const workflow = await this.getWorkflowById(workflowId, userId);

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    return this.workflowsRepository.findActionsByWorkflowForUser(
      workflowId,
      userId,
    );
  }

  async findExecutionsByWorkflow(workflowId: string, userId: string) {
    const workflow = await this.getWorkflowById(workflowId, userId);

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    return this.workflowsRepository.findExecutionsByWorkflow(workflowId, userId);
  }

  getAllowedTriggers(): TriggerType[] {
    return [...BUSINESS_EVENT_TYPES] as TriggerType[];
  }

  async getWorkflowById(id: string, userId: string) {
    return this.workflowsRepository.findByIdForUser(id, userId);
  }

  async updateWorkflow(id: string, _userId: string, trigger: TriggerType) {
    // Le contrôle de propriété est déjà fait côté controller via getWorkflowById.
    return this.workflowsRepository.updateTrigger(id, trigger);
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
