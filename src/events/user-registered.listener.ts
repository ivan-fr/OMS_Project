import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { TriggerType } from '@prisma/client';

@Injectable()
export class UserRegisteredListener {
  constructor(private readonly prisma: PrismaService) {}

  @OnEvent(TriggerType.USER_REGISTERED)
  async handleUserRegisteredEvent(payload: { userId: string; email: string }) {
    console.log(`Event ${TriggerType.USER_REGISTERED} reçu:`, payload);

    await this.prisma.appLog.create({
      data: {
        level: 'info',
        message: `Nouvel utilisateur inscrit: ${payload.email}`,
        context: {
          userId: payload.userId,
          email: payload.email,
          event: TriggerType.USER_REGISTERED,
        },
      },
    });
  }
}