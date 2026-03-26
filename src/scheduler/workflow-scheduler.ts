import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { TriggerType } from "@prisma/client";

@Injectable()
export class WorkflowScheduler {
    private readonly logger = new Logger(WorkflowScheduler.name);

    constructor(
        private readonly eventEmitter: EventEmitter2,
    ) {}

    @Cron('*/5 * * * *') // Toutes les 5 minutes
    async handleCron() {
        this.logger.log('[CRON] Starting handleCron execution for ORDER_NUM event');

        try {
            // Cas BONUS global: on calcule le total des commandes payées, tous users confondus.
            this.logger.log('[CRON] Emitting ORDER_NUM global event');
            this.eventEmitter.emit(TriggerType.ORDER_NUM, {
                eventType: TriggerType.ORDER_NUM,
                data: {
                    userId: 'SYSTEM',
                },
            });

            this.logger.log('[CRON] handleCron execution completed successfully');
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`[CRON] handleCron failed: ${errorMsg}`, error instanceof Error ? error.stack : undefined);
        }
    }
}