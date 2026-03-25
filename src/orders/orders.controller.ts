import { Body, Controller, Get, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() body: { amount: number; userId: string }) {
    return this.ordersService.create(body);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }
}

