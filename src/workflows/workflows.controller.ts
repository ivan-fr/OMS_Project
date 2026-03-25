import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateWorkflowDto, WorkflowsService } from './workflows.service';

@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post()
  create(@Body() dto: CreateWorkflowDto) {
    return this.workflowsService.create(dto);
  }

  @Get()
  findAll() {
    return this.workflowsService.findAll();
  }

  @Get('active')
  findActive() {
    return this.workflowsService.findActive();
  }

  @Get('triggers')
  getTriggers() {
    return this.workflowsService.getAllowedTriggers();
  }
}

