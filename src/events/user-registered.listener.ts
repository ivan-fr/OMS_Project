import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TriggerType } from '@prisma/client';
import { AppLogHelperService } from '../appLog/app-log-helper.service';
import { BusinessEventPayloadDto } from './business-event-payload.dto';

@Injectable()
export class UserRegisteredListener {
  constructor(private readonly appLogHelper: AppLogHelperService) {}

  @OnEvent(TriggerType.USER_REGISTERED)
  async handleUserRegisteredEvent(payload: BusinessEventPayloadDto) {
    console.log(`Event ${TriggerType.USER_REGISTERED} reçu:`, payload);

    await this.appLogHelper.info(
      `Nouvel utilisateur inscrit: ${payload.userId} (${payload.email})`,
      {
        userId: payload.userId,
        email: payload.email,
        event: TriggerType.USER_REGISTERED,
      },
    );
  }
}