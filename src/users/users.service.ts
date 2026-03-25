import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type CreateUserInput = {
	email: string;
	passwordHash: string;
};
import {EventEmitter2} from '@nestjs/event-emitter';

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService, private eventEmitter: EventEmitter2) {}

	findByEmail(email: string) {
		return this.prisma.user.findUnique({ where: { email } });
	}

	create(input: CreateUserInput) {
        this.eventEmitter.emit('user.registered',input);
		return this.prisma.user.create({
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
	}
}
