import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	UseGuards,
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

@ApiTags('Workflows')
@Controller('workflows')
export class WorkflowsController {
	constructor(private readonly workflowsService: WorkflowsService) {}

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
}
