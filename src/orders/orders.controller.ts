import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une commande (US02)' })
  @ApiBody({ schema: { example: { amount: 99.9 } } })
  create(@Req() req: { user: { sub: string } }, @Body() body: { amount: number }) {
    // L'utilisateur ne peut créer que ses propres commandes.
    return this.ordersService.create({ amount: body.amount, userId: req.user.sub });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Lister les commandes d'un utilisateur" })
  findAll(@Req() req: { user: { sub: string } }) {
    return this.ordersService.findAll(req.user.sub);
  }
}

