// Workflow Processor pour la logique d'éxecution des workflows
import { OnEvent } from "@nestjs/event-emitter";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { TriggerType } from "@prisma/client";
import { Workflow } from "@prisma/client";
import { WorkflowAction as Action } from "@prisma/client";

@Injectable()
export class WorkflowsProcessor {
    constructor(private prisma: PrismaService) {}
    @OnEvent('user.registered')
    async handleUserRegisteredEvent(payload) {
        console.log("event de creation d'utilisateur data: ", payload);
        // Logique pour déclencher les workflows associés à l'événement d'inscription d'un utilisateur
        // Par exemple, envoyer un email de bienvenue, créer un profil utilisateur, etc.
        await this.executeWorkflows(TriggerType.USER_REGISTERED, payload);  
    }

    @OnEvent('order.created')
    async handleOrderCreatedEvent(payload) {
        console.log("event de creation d'une commande data: ", payload);
        // Logique pour déclencher les workflows associés à l'événement de création d'une commande
        await this.executeWorkflows(TriggerType.ORDER_CREATED, payload);
    }

    @OnEvent('order.paid')
    async handleOrderPaidEvent(payload) {
        console.log("event de paiement d'une commande data: ", payload);
        // Logique pour déclencher les workflows associés à l'événement de paiement d'une commande
        await this.executeWorkflows(TriggerType.ORDER_PAID, payload);
    }

    @OnEvent('manual.trigger')
    async handleManualTriggerEvent(payload) {
        console.log("event de declenchement manuel data: ", payload);
        // Logique pour déclencher les workflows associés à l'événement de déclenchement manuel
        await this.executeWorkflows(TriggerType.MANUAL_TRIGGER, payload);
    }

    private async executeWorkflows(trigger: TriggerType, playload: any) {
        const workflows = await this.prisma.workflow.findMany({
            where: {
                trigger: trigger,
                isActive: true,
            },
        });
        for (const workflow of workflows) {
            await this.runWorkflow(workflow);
        }
    }

    private async runWorkflow(workflow: Workflow) {
        // Logique pour exécuter les actions d'un workflow
        const workflowActions = await this.prisma.workflowAction.findMany({
            where: {
                workflowId: workflow.id,
            },
        });
        console.log(`Execution workflow avec L'ID : ${workflow.id}`);
        for (const action of workflowActions) {
            await this.runWorkflowAction(action);
        }
    }

    private async runWorkflowAction(action : Action) {
        // Logique pour exécuter une action spécifique d'un workflow
        console.log(`Execution action avec L'ID : ${action.id} et type : ${action.type}`);
    }
}