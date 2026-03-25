import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';

@Injectable()
export class WorkflowsService {
	constructor(private readonly prisma: PrismaService) {}

	create(userId: string, dto: CreateWorkflowDto) {
		return this.prisma.workflow.create({
			data: {
				name: dto.name,
				isActive: dto.isActive ?? true,
				userId,
				// Trigger par défaut
				trigger: 'manual.trigger',
			},
			select: {
				id: true,
				name: true,
				isActive: true,
				trigger: true,
				userId: true,
				createdAt: true,
			},
		});
	}
}
