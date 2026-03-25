import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';

describe('WorkflowsController', () => {
  let controller: WorkflowsController;

  const workflowsServiceMock = {
    create: jest.fn(),
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
});
