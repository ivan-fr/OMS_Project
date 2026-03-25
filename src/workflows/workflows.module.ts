import { Module } from '@nestjs/common';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { WorkflowMatcherService } from './services/workflow-matcher.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [WorkflowsController],
  providers: [WorkflowsService, WorkflowMatcherService],
  exports: [WorkflowsService, WorkflowMatcherService],
})
export class WorkflowsModule {}

