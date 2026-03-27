import { InternalServerErrorException } from '@nestjs/common';
import { ActionType } from '@prisma/client';
import { ActionExecutorService } from './action-executor.service';

describe('ActionExecutorService', () => {
  it('délègue vers le bon handler selon ActionType', async () => {
    const notifyAdminHandler = {
      type: ActionType.NOTIFY_ADMIN,
      execute: jest.fn().mockResolvedValue('ok-admin'),
    };

    const service = new ActionExecutorService(
      notifyAdminHandler as any,
      { type: ActionType.NOTIFY_USER, execute: jest.fn() } as any,
      { type: ActionType.CREATE_LOG, execute: jest.fn() } as any,
      { type: ActionType.CREATE_TASK_DB, execute: jest.fn() } as any,
      { type: ActionType.UPDATE_STATUS, execute: jest.fn() } as any,
      { type: ActionType.CALL_WEBHOOK, execute: jest.fn() } as any,
    );

    const result = await service.executeAction(
      'exec-1',
      {
        id: 'a1',
        workflowId: 'wf1',
        type: ActionType.NOTIFY_ADMIN,
        order: 1,
      } as any,
      { userId: 'u1' },
    );

    expect(notifyAdminHandler.execute).toHaveBeenCalled();
    expect(result).toBe('ok-admin');
  });

  it('lève une erreur si aucun handler n’existe', async () => {
    const service = new ActionExecutorService(
      { type: ActionType.NOTIFY_ADMIN, execute: jest.fn() } as any,
      { type: ActionType.NOTIFY_USER, execute: jest.fn() } as any,
      { type: ActionType.CREATE_LOG, execute: jest.fn() } as any,
      { type: ActionType.CREATE_TASK_DB, execute: jest.fn() } as any,
      { type: ActionType.UPDATE_STATUS, execute: jest.fn() } as any,
      { type: ActionType.CALL_WEBHOOK, execute: jest.fn() } as any,
    );

    await expect(
      service.executeAction(
        'exec-1',
        {
          id: 'a1',
          workflowId: 'wf1',
          type: 'UNKNOWN_TYPE',
          order: 1,
        } as any,
        { userId: 'u1' },
      ),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('exécute une action standalone sans workflow', async () => {
    const notifyUserHandler = {
      type: ActionType.NOTIFY_USER,
      execute: jest.fn().mockResolvedValue('ok-user'),
    };

    const service = new ActionExecutorService(
      { type: ActionType.NOTIFY_ADMIN, execute: jest.fn() } as any,
      notifyUserHandler as any,
      { type: ActionType.CREATE_LOG, execute: jest.fn() } as any,
      { type: ActionType.CREATE_TASK_DB, execute: jest.fn() } as any,
      { type: ActionType.UPDATE_STATUS, execute: jest.fn() } as any,
      { type: ActionType.CALL_WEBHOOK, execute: jest.fn() } as any,
    );

    const result = await service.executeStandaloneAction(
      ActionType.NOTIFY_USER,
      { userId: 'u1' },
    );

    expect(notifyUserHandler.execute).toHaveBeenCalled();
    expect(result).toBe('ok-user');
  });
});
