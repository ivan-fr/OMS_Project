import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TriggerType } from '@prisma/client';
import { BusinessEventPayloadDto } from '../events/business-event-payload.dto';
import { UsersRepository } from '../repositories/users.repository';

type CreateUserInput = {
  email: string;
  passwordHash: string;
};

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  async create(input: CreateUserInput) {
    const user = await this.usersRepository.createUser(input);

    // Émet l'événement d'inscription pour les workflows.
    this.eventEmitter.emit(TriggerType.USER_REGISTERED, {
      eventType: TriggerType.USER_REGISTERED,
      data: { userId: user.id, email: user.email } as BusinessEventPayloadDto,
    });

    return user;
  }
}
