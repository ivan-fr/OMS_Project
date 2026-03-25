import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WorkflowsController', () => {
  let controller: WorkflowsController;

  const workflowsServiceMock = {
    create: jest.fn(),
    getWorkflowById: jest.fn(),
    updateWorkflow: jest.fn(),
  };

  const prismaServiceMock = {} as PrismaService;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new WorkflowsController(
      prismaServiceMock,
      workflowsServiceMock as unknown as WorkflowsService,
    );
  });

  it('create: utilise userId issu du token (req.user.sub)', async () => {
    workflowsServiceMock.create.mockResolvedValue({
      id: 'wf1',
      name: 'Workflow from controller',
      isActive: true,
      trigger: 'manual.trigger',
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
    const existingWorkflow = {
      id: workflowId,
      name: 'Existing workflow',
      isActive: true,
      trigger: 'MANUAL_TRIGGER',
      userId: 'user-42',
      createdAt: new Date(),
    };

    workflowsServiceMock.getWorkflowById.mockResolvedValue(existingWorkflow);
    workflowsServiceMock.updateWorkflow.mockResolvedValue({
      ...existingWorkflow,
      trigger: 'ORDER_CREATED',
    });

    const result = await controller.triggerworkflow(workflowId, { trigger: 'ORDER_CREATED' });

    expect(workflowsServiceMock.getWorkflowById).toHaveBeenCalledWith(workflowId);
    expect(workflowsServiceMock.updateWorkflow).toHaveBeenCalledWith(workflowId, { trigger: 'ORDER_CREATED' });
    expect(result.trigger).toBe('ORDER_CREATED');
  });
});
