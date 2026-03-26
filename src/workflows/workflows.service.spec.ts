import { Test, TestingModule } from '@nestjs/testing';
import { TriggerType } from '@prisma/client';
import { WorkflowsService } from './workflows.service';
import { WorkflowsRepository } from '../repositories/workflows.repository';

describe('WorkflowsService', () => {
  let service: WorkflowsService;

  const workflowsRepositoryMock = {
    createWorkflow: jest.fn(),
    updateTrigger: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowsService,
        { provide: WorkflowsRepository, useValue: workflowsRepositoryMock },
      ],
    }).compile();

    service = module.get<WorkflowsService>(WorkflowsService);
  });

  it('create: crée un workflow avec isActive explicite', async () => {
    workflowsRepositoryMock.createWorkflow.mockResolvedValue({
      id: 'wf1',
      name: 'Workflow test',
      isActive: false,
      trigger: TriggerType.MANUAL_TRIGGER,
      userId: 'user-1',
      createdAt: new Date(),
    });

    const result = await service.create('user-1', {
      name: 'Workflow test',
      isActive: false,
    });

    expect(workflowsRepositoryMock.createWorkflow).toHaveBeenCalledWith('user-1', {
      name: 'Workflow test',
      isActive: false,
    });
    expect(result.userId).toBe('user-1');
  });

  it('create: applique isActive=true par défaut', async () => {
    workflowsRepositoryMock.createWorkflow.mockResolvedValue({
      id: 'wf2',
      name: 'Workflow default active',
      isActive: true,
      trigger: TriggerType.MANUAL_TRIGGER,
      userId: 'user-2',
      createdAt: new Date(),
    });

    await service.create('user-2', {
      name: 'Workflow default active',
    });

    expect(workflowsRepositoryMock.createWorkflow).toHaveBeenCalledWith('user-2', {
      name: 'Workflow default active',
    });
  });

  it('updateWorkflow: met à jour le trigger d’un workflow', async () => {
    workflowsRepositoryMock.updateTrigger.mockResolvedValue({
      id: 'wf-1',
      userId: 'user-1',
      trigger: TriggerType.ORDER_CREATED,
    });

    const result = await service.updateWorkflow(
      'wf-1',
      'user-1',
      TriggerType.ORDER_CREATED,
    );

    expect(workflowsRepositoryMock.updateTrigger).toHaveBeenCalledWith(
      'wf-1',
      TriggerType.ORDER_CREATED,
    );
    expect(result.trigger).toBe(TriggerType.ORDER_CREATED);
  });
});
