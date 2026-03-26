import { Test, TestingModule } from '@nestjs/testing';
import { EngineService } from './engine.service';
import { WorkflowMatcherService } from '../workflows/services/workflow-matcher.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ActionExecutorService } from './actions/action-executor.service';
import { WorkflowConditionService } from './services/workflow-condition.service';
import { AppLogHelperService } from '../appLog/app-log-helper.service';
import { OrdersRepository } from '../repositories/orders.repository';
import { WorkflowsRepository } from '../repositories/workflows.repository';
import { WorkflowExecutionsRepository } from '../repositories/workflow-executions.repository';

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
    const mockActionExecutor = {
      executeAction: jest.fn(),
    };
    const mockWorkflowConditionService = {
      evaluate: jest.fn().mockReturnValue(true),
    };
    const mockAppLogHelperService = {
      info: jest.fn(),
      warning: jest.fn(),
      error: jest.fn(),
      getLogsForUser: jest.fn(),
    };
    const mockOrdersRepository = {
      countPaidByUser: jest.fn(),
    };
    const mockWorkflowsRepository = {
      findActionsByWorkflowOrdered: jest.fn(),
    };
    const mockWorkflowExecutionsRepository = {
      createWorkflowExecution: jest.fn(),
      updateWorkflowExecutionStatus: jest.fn(),
      createActionExecution: jest.fn(),
      updateActionExecutionStatus: jest.fn(),
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
          provide: ActionExecutorService,
          useValue: mockActionExecutor,
        },
        {
          provide: WorkflowConditionService,
          useValue: mockWorkflowConditionService,
        },
        {
          provide: AppLogHelperService,
          useValue: mockAppLogHelperService,
        },
        {
          provide: OrdersRepository,
          useValue: mockOrdersRepository,
        },
        {
          provide: WorkflowsRepository,
          useValue: mockWorkflowsRepository,
        },
        {
          provide: WorkflowExecutionsRepository,
          useValue: mockWorkflowExecutionsRepository,
        },
      ],
    }).compile();

    service = module.get<EngineService>(EngineService);
    matcherService = module.get(WorkflowMatcherService);
  });

  it('doit arrêter le traitement si aucun workflow ne correspond', async () => {
    matcherService.findMatchingWorkflows.mockResolvedValue([]);

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
