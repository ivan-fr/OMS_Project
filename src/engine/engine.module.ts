import { Module } from '@nestjs/common';
import { EngineController } from './engine.controller';
import { EngineService } from './engine.service';
import { WorkflowMatcherService } from './workflow-matcher.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EngineController],
  providers: [EngineService, WorkflowMatcherService],
  exports: [WorkflowMatcherService],
})
export class EngineModule {}

