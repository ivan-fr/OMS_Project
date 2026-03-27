import { IsEnum, IsInt, IsOptional } from "class-validator";
import { ActionType } from "@prisma/client";
import { BusinessEventPayloadDto } from "src/events/business-event-payload.dto";
export class CreateActionDto {
    @IsEnum(ActionType)
    type: ActionType;

    @IsInt()
    order: number;
    

}