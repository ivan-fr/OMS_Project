import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { TriggerType } from '@prisma/client';

describe('WorkflowsController', () => {
  let controller: WorkflowsController;

  const workflowsServiceMock = {
    create: jest.fn(),
    assignTriggerToWorkflow: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new WorkflowsController(
      workflowsServiceMock as unknown as WorkflowsService,
    );
  });

  it('create: utilise userId issu du token (req.user.sub)', async () => {
    workflowsServiceMock.create.mockResolvedValue({
      id: 'wf1',
      name: 'Workflow from controller',
      isActive: true,
      trigger: TriggerType.MANUAL_TRIGGER,
      userId: 'user-42',
      createdAt: new Date(),
    });

    const req = { user: { sub: 'user-42' } };
    const dto = { name: 'Workflow from controller', isActive: true };

    const result = await controller.create(req, dto);

    // Le controller reste fin: il délègue au service.
    expect(workflowsServiceMock.create).toHaveBeenCalledWith('user-42', dto);
    expect(result.userId).toBe('user-42');
  });

  it('triggerworkflow: met à jour le workflow actif', async () => {
    const workflowId = 'test-id';
    workflowsServiceMock.assignTriggerToWorkflow.mockResolvedValue({
      id: workflowId,
      name: 'Existing workflow',
      isActive: true,
      trigger: TriggerType.ORDER_CREATED,
      userId: 'user-42',
      createdAt: new Date(),
    });

    const req = { user: { sub: 'user-42' } };
    const result = await controller.triggerworkflow(req, workflowId, { trigger: TriggerType.ORDER_CREATED });

    expect(workflowsServiceMock.assignTriggerToWorkflow).toHaveBeenCalledWith(
      workflowId,
      'user-42',
      TriggerType.ORDER_CREATED,
    );
    expect(result.trigger).toBe(TriggerType.ORDER_CREATED);
  });
});
