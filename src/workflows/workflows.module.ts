import { Module } from '@nestjs/common';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { AuthModule } from '../auth/auth.module';
import { WorkflowMatcherService } from './services/workflow-matcher.service';
import { RepositoriesModule } from '../repositories/repositories.module';

@Module({
  imports: [RepositoriesModule, AuthModule],
  controllers: [WorkflowsController],
  providers: [WorkflowsService, WorkflowMatcherService],
  exports: [WorkflowsService, WorkflowMatcherService],
})
export class WorkflowsModule {}

