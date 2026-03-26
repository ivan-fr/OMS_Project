import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { EngineModule } from './engine/engine.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserRegisteredListener } from './events/user-registered.listener';
import { AppLogModule } from './appLog/app-log.module';
import { WorkflowScheduler } from './scheduler/workflow-scheduler';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    OrdersModule,
    WorkflowsModule,
    EngineModule,
    PrismaModule,
    AppLogModule,
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    UserRegisteredListener,
    WorkflowScheduler,
  ],
})
export class AppModule {}
