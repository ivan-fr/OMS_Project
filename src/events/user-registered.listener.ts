import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TriggerType } from '@prisma/client';
import { AppLogHelperService } from '../appLog/app-log-helper.service';

@Injectable()
export class UserRegisteredListener {
  constructor(private readonly appLogHelper: AppLogHelperService) {}

  @OnEvent(TriggerType.USER_REGISTERED)
  async handleUserRegisteredEvent(payload: { userId: string; email: string }) {
    console.log(`Event ${TriggerType.USER_REGISTERED} reçu:`, payload);

    await this.appLogHelper.info(
      `Nouvel utilisateur inscrit: ${payload.email}`,
      {
        userId: payload.userId,
        email: payload.email,
        event: TriggerType.USER_REGISTERED,
      },
    );
  }
}