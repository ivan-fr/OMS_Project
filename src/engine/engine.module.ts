import { Module } from '@nestjs/common';
import { EngineController } from './engine.controller';
import { EngineService } from './engine.service';
import { AuthModule } from '../auth/auth.module';
import { WorkflowsModule } from '../workflows/workflows.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ActionExecutorService } from './actions/action-executor.service';
import { NotifyAdminHandler } from './actions/handlers/notify-admin.handler';
import { NotifyUserHandler } from './actions/handlers/notify-user.handler';
import { CreateLogHandler } from './actions/handlers/create-log.handler';
import { CreateTaskHandler } from './actions/handlers/create-task.handler';
import { UpdateStatusHandler } from './actions/handlers/update-status.handler';

@Module({
  imports: [AuthModule, WorkflowsModule, PrismaModule],
  controllers: [EngineController],
  providers: [
    EngineService,
    ActionExecutorService,
    NotifyAdminHandler,
    NotifyUserHandler,
    CreateLogHandler,
    CreateTaskHandler,
    UpdateStatusHandler,
  ],
})
export class EngineModule {}

