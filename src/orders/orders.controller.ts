import { Body, Controller, Get, Post, Req, UseGuards, HttpCode, HttpStatus, } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une commande' })
  create(
    @Body() dto: CreateOrderDto,
    @Req() req: { user: { sub: string; email: string } },
  ) {
    return this.ordersService.create(dto, req.user.sub);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister les commandes de l’utilisateur connecté' })
  findMyOrders(
    @Req() req: { user: { sub: string; email: string } },
  ) {
    return this.ordersService.findByUser(req.user.sub);
  }
}