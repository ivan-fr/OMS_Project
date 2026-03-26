import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PrismaService } from "../prisma/prisma.service";
import { TriggerType } from "@prisma/client";
import { BusinessEventPayloadDto } from "src/events/business-event-payload.dto";

@Injectable()
export class WorkflowScheduler {
    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
    ) {}
    @Cron('*/5 * * * *') // Toutes les 5 minutes
    async handleCron() {
         // Cas BONUS pour ORDER_NUM: on veut enregistrer dans les log le nombre total de commandes déjà payées périodiquement.
        this.eventEmitter.emit(TriggerType.ORDER_NUM, {data: {}, });
    }
}