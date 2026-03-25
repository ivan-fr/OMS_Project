import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type CreateUserInput = {
	email: string;
	passwordHash: string;
};

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

	findByEmail(email: string) {
		return this.prisma.user.findUnique({ where: { email } });
	}

	create(input: CreateUserInput) {
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
