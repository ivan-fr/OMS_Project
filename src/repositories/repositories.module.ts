import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersRepository } from './users.repository';
import { OrdersRepository } from './orders.repository';
import { WorkflowsRepository } from './workflows.repository';
import { WorkflowExecutionsRepository } from './workflow-executions.repository';
import { TasksRepository } from './tasks.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    UsersRepository,
    OrdersRepository,
    WorkflowsRepository,
    WorkflowExecutionsRepository,
    TasksRepository,
  ],
  exports: [
    UsersRepository,
    OrdersRepository,
    WorkflowsRepository,
    WorkflowExecutionsRepository,
    TasksRepository,
  ],
})
export class RepositoriesModule {}
