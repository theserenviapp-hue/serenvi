import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class MeService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { distributor: true },
    });

    if (!user) throw new NotFoundException('User not found');
    if (!user.distributor) throw new NotFoundException('Distributor profile missing');

    const d = user.distributor;
    return {
      userId: user.id,
      distributorId: d.id,
      name: d.name,
      email: d.email,
      phone: d.phone,
      rank: d.rank,
      referralCode: d.referralCode,
      walletBalance: d.walletBalance,
      totalSales: d.totalSales,
      monthlySales: d.monthlySales,
      sponsorId: d.sponsorId,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    };
  }
}
