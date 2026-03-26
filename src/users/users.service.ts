import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TriggerType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessEventPayloadDto } from 'src/events/business-event-payload.dto';

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

    // Émet l'événement d'inscription pour les workflows.
    this.eventEmitter.emit(TriggerType.USER_REGISTERED, {
      eventType: TriggerType.USER_REGISTERED,
      data: { userId: user.id, email: user.email } as BusinessEventPayloadDto,
    });

    return user;
  }
}
