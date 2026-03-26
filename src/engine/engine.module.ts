import { Module } from '@nestjs/common';
import { EngineController } from './engine.controller';
import { EngineService } from './engine.service';
import { AuthModule } from '../auth/auth.module';
import { WorkflowsModule } from '../workflows/workflows.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AuthModule, WorkflowsModule, PrismaModule],
  controllers: [EngineController],
  providers: [EngineService],
})
export class EngineModule {}

