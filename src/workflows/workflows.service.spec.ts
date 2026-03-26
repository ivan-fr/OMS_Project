import { Test, TestingModule } from '@nestjs/testing';
import { TriggerType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WorkflowsService } from './workflows.service';

describe('WorkflowsService', () => {
  let service: WorkflowsService;

  const prismaMock = {
    workflow: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<WorkflowsService>(WorkflowsService);
  });

  it('create: crée un workflow avec isActive explicite', async () => {
    prismaMock.workflow.create.mockResolvedValue({
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

    expect(prismaMock.workflow.create).toHaveBeenCalledWith({
      data: {
        name: 'Workflow test',
        isActive: false,
        condition: undefined,
        userId: 'user-1',
        trigger: TriggerType.MANUAL_TRIGGER,
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
    expect(result.userId).toBe('user-1');
  });

  it('create: applique isActive=true par défaut', async () => {
    prismaMock.workflow.create.mockResolvedValue({
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

    expect(prismaMock.workflow.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          isActive: true,
          userId: 'user-2',
          trigger: TriggerType.MANUAL_TRIGGER,
        }),
      }),
    );
  });

  it('updateWorkflow: met à jour le trigger d’un workflow', async () => {
    prismaMock.workflow.update.mockResolvedValue({
      id: 'wf-1',
      userId: 'user-1',
      trigger: TriggerType.ORDER_CREATED,
    });

    const result = await service.updateWorkflow(
      'wf-1',
      'user-1',
      TriggerType.ORDER_CREATED,
    );

    expect(prismaMock.workflow.update).toHaveBeenCalledWith({
      where: { id: 'wf-1' },
      data: { trigger: TriggerType.ORDER_CREATED },
    });
    expect(result.trigger).toBe(TriggerType.ORDER_CREATED);
  });
});
