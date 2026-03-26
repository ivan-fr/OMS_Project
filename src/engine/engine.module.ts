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
import { CallWebhookHandler } from './actions/handlers/call-webhook.handler';
import { LogsController } from './logs.controller';
import { WorkflowConditionService } from './services/workflow-condition.service';
import { AppLogModule } from '../appLog/app-log.module';

@Module({
  imports: [AuthModule, WorkflowsModule, PrismaModule, AppLogModule],
  controllers: [EngineController, LogsController],
  providers: [
    EngineService,
    WorkflowConditionService,
    ActionExecutorService,
    NotifyAdminHandler,
    NotifyUserHandler,
    CreateLogHandler,
    CreateTaskHandler,
    UpdateStatusHandler,
    CallWebhookHandler,
  ],
})
export class EngineModule {}

