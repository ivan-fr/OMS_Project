import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowsService } from './workflows.service';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessEventTypesEnum } from 'src/events/business-event.dto';

describe('WorkflowsService', () => {
  let service: WorkflowsService;

  const prismaMock = {
    workflow: {
      create: jest.fn(),
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
      trigger: 'manual.trigger',
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
        // US05: trigger fixé côté serveur.
        trigger: BusinessEventTypesEnum.MANUAL_TRIGGER,
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
      trigger: BusinessEventTypesEnum.MANUAL_TRIGGER,
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
          trigger: BusinessEventTypesEnum.MANUAL_TRIGGER,
        }),
      }),
    );
  });
});
