import { Test, TestingModule } from '@nestjs/testing';
import { EngineService } from './engine.service';
import { WorkflowMatcherService } from '../workflows/services/workflow-matcher.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { ActionExecutorService } from './actions/action-executor.service';

describe('EngineService - handleBusinessEvent', () => {
  let service: EngineService;
  let matcherService: jest.Mocked<WorkflowMatcherService>;

  beforeEach(async () => {
    const mockMatcher = {
      findMatchingWorkflows: jest.fn(),
    };
    const mockEventEmitter = {
      emit: jest.fn(),
    };
    const mockPrisma = {
      appLog: { create: jest.fn() },
      workflowExecution: { create: jest.fn().mockResolvedValue({ id: 'exec-1' }), update: jest.fn() },
      workflowAction: { findMany: jest.fn().mockResolvedValue([]) },
      actionExecution: { create: jest.fn(), update: jest.fn() },
    };
    const mockActionExecutor = {
      executeAction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EngineService,
        {
          provide: WorkflowMatcherService,
          useValue: mockMatcher,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: ActionExecutorService,
          useValue: mockActionExecutor,
        },
      ],
    }).compile();

    service = module.get<EngineService>(EngineService);
    matcherService = module.get(WorkflowMatcherService) as any;
  });

  it('doit arrêter le traitement si aucun workflow ne correspond', async () => {
    matcherService.findMatchingWorkflows.mockResolvedValue([]);

    jest.spyOn(service as any, 'writeAppLog').mockResolvedValue(undefined);
    const spyLogger = jest.spyOn(service['logger'], 'warn').mockImplementation();

    await service.handleBusinessEvent({
      eventType: 'ORDER_CREATED' as any,
      data: { userId: 'u1' },
    });

    expect(matcherService.findMatchingWorkflows).toHaveBeenCalledWith(
      'ORDER_CREATED',
      'u1'
    );
    expect(spyLogger).toHaveBeenCalledWith(
      expect.stringContaining('No active workflow found')
    );
    
    spyLogger.mockRestore();
  });
});
