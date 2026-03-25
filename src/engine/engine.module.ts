import { Module } from '@nestjs/common';
import { EngineController } from './engine.controller';
import { EngineService } from './engine.service';
import { AuthModule } from '../auth/auth.module';
import { WorkflowsModule } from '../workflows/workflows.module';

@Module({
  imports: [AuthModule, WorkflowsModule],
  controllers: [EngineController],
  providers: [EngineService],
})
export class EngineModule {}

