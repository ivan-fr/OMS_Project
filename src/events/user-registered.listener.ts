import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserRegisteredListener {
  constructor(private readonly prisma: PrismaService) {}

  @OnEvent('user.registered')
  async handleUserRegisteredEvent(payload: { userId: string; email: string }) {
    console.log('Event user.registered reçu:', payload);

    await this.prisma.appLog.create({
      data: {
        level: 'info',
        message: `Nouvel utilisateur inscrit: ${payload.email}`,
        context: {
          userId: payload.userId,
          email: payload.email,
          event: 'user.registered',
        },
      },
    });
  }
}