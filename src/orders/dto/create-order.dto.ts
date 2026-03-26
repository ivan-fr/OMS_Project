import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsPositive } from "class-validator";

export class CreateOrderDto {
    @ApiProperty({ example: 150.5, description: 'Montant de la commande (> 0)' })
    @IsNumber()
    @IsPositive()
    amount: number;
}