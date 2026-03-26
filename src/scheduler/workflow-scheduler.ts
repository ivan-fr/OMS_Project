import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PrismaService } from "../prisma/prisma.service";
import { TriggerType } from "@prisma/client";

@Injectable()
export class WorkflowScheduler {
    private readonly logger = new Logger(WorkflowScheduler.name);
    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
    ) {}
    @Cron('*/5 * * * *') // Toutes les 5 minutes
    async handleCron() {
        this.logger.log('[CRON] Starting handleCron execution for ORDER_NUM event');

        try {
            // Cas BONUS pour ORDER_NUM: on veut enregistrer dans les log le nombre total de commandes déjà payées périodiquement.
            // Pas de userId spécifique => on doit itérer tous les users
            const allUsers = await this.prisma.user.findMany();
            this.logger.log(`[CRON] Found ${allUsers.length} users to process`);

            for (const user of allUsers) {
                this.logger.log(`[CRON] Emitting ORDER_NUM event for userId: ${user.id}`);
                this.eventEmitter.emit(TriggerType.ORDER_NUM, {
                    eventType: TriggerType.ORDER_NUM,
                    data: {
                        userId: user.id,
                    },
                });
            }

            this.logger.log('[CRON] handleCron execution completed successfully');
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`[CRON] handleCron failed: ${errorMsg}`, error instanceof Error ? error.stack : undefined);
        }
    }
}