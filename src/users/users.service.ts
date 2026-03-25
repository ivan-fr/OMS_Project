import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';

type CreateUserInput = {
	email: string;
	passwordHash: string;
};

@Injectable()
export class UsersService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly eventEmitter: EventEmitter2,
	) {}

	findByEmail(email: string) {
		return this.prisma.user.findUnique({ where: { email } });
	}

	async create(input: CreateUserInput) {
		const user = await this.prisma.user.create({
			data: {
				email: input.email,
				passwordHash: input.passwordHash,
			},
			select: {
				id: true,
				email: true,
				createdAt: true,
			},
		});

		this.eventEmitter.emit('user.registered', {
			eventType: 'user.registered',
			data: { userId: user.id, email: user.email },
		});

		return user;
	}
}



