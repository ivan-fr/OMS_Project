import { IsEnum, IsInt, IsOptional } from "class-validator";
import { ActionType } from "@prisma/client";
export class CreateActionDto {
    @IsEnum(ActionType)
    type: ActionType;

    @IsInt()
    order: number;
    
    @IsOptional()
    config?: any;
}