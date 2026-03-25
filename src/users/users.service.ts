import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessEventTypesEnum } from 'src/events/business-event.dto';
import { BusinessEventPayloadDto } from 'src/events/business-event-payload.dto';

type CreateUserInput = {
	email: string;
	passwordHash: string;
};
import {EventEmitter2} from '@nestjs/event-emitter';

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

		this.eventEmitter.emit(BusinessEventTypesEnum.USER_REGISTERED, {
			eventType: BusinessEventTypesEnum.USER_REGISTERED,
			data: { userId: user.id, email: user.email } as BusinessEventPayloadDto,
		});

		return user;
	}
}
