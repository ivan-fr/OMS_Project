import { IsEnum } from "class-validator";
import { TriggerType } from "@prisma/client";
export class UpdateTriggerDto {
    @IsEnum(TriggerType)
    trigger: TriggerType;
}