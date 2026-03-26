import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  createOrder(input: { amount: number; userId: string; status?: string }) {
    return this.prisma.order.create({
      data: {
        amount: input.amount,
        userId: input.userId,
        status: input.status ?? 'created',
      },
    });
  }

  findByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  updateStatus(orderId: string, newStatus: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });
  }

  countPaidByUser(userId: string) {
    return this.prisma.order.count({
      where: { status: 'paid', userId },
    });
  }
}
