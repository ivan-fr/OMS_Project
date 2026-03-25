import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	UseGuards,
	BadRequestException,
	NotFoundException,
	Param,
	Patch
} from '@nestjs/common';

import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { WorkflowsService } from './workflows.service';

import { PrismaService } from '../prisma/prisma.service';
import { UpdateTriggerDto } from './dto/updata-trigger.dto';

@ApiTags('Workflows')
@Controller('workflows')
export class WorkflowsController {
	constructor(private readonly prisma: PrismaService,private readonly workflowsService: WorkflowsService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.CREATED)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Créer un workflow (US05)' })
	@ApiBody({ type: CreateWorkflowDto })
	create(
		@Req() req: { user: { sub: string } },
		@Body() dto: CreateWorkflowDto,
	) {
		// Le workflow appartient toujours à l'utilisateur connecté.
		return this.workflowsService.create(req.user.sub, dto);
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Lister workflows par utilisateur' })
	findAll(@Req() req: { user: { sub: string } }) {
		return this.workflowsService.findAll(req.user.sub);
	}

	@Get('active')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Lister workflows actifs par utilisateur' })
	findActive(@Req() req: { user: { sub: string } }) {
		return this.workflowsService.findActive(req.user.sub);
	}

	@Get('triggers')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Lister les triggers autorisés' })
	getTriggers() {
		return this.workflowsService.getAllowedTriggers();
	}

    @Patch(':id/trigger')
    async triggerworkflow(@Param('id') id: string, @Body() updateTriggerValueToUpdate: UpdateTriggerDto) {
        // Implementation Ajout d'un trigger à un workflow
        const workflow = await this.workflowsService.getWorkflowById(id);

        if (!workflow || workflow === null) throw new NotFoundException();
        if (!workflow.isActive) {
            throw new BadRequestException("Workflow is not active");
        }else{
            const updatedWorkflow = await this.workflowsService.updateWorkflow(id, {trigger:updateTriggerValueToUpdate.trigger});
            return updatedWorkflow;
        }
    }
}
