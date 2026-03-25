import { Body, Controller, Post } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BusinessEventDto } from '../events/business-event.dto';
import { WorkflowMatcherService } from './workflow-matcher.service';

@Controller('events')
export class EngineController {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly matcher: WorkflowMatcherService,
  ) {}

  @Post()
  async receiveEvent(@Body() dto: BusinessEventDto) {
    const matchedWorkflows = await this.matcher.findMatchingWorkflows(
      dto.eventType,
    );

    this.eventEmitter.emit(dto.eventType, {
      eventType: dto.eventType,
      data: dto.payload ?? {},
    });

    return {
      eventType: dto.eventType,
      matchedWorkflows,
      triggeredAt: new Date().toISOString(),
    };
  }
}
