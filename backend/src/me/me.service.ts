import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

interface OnboardingPayload {
  name?: string;
  phone: string;
  referralCode?: string;
}

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
    const onboarded = !!d.phone && d.phone.trim().length > 0;
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
      onboarded,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    };
  }

  async completeOnboarding(userId: string, payload: OnboardingPayload) {
    const { name, phone, referralCode } = payload;

    if (!phone || !phone.trim()) {
      throw new BadRequestException('Phone number required');
    }
    const cleanedPhone = phone.replace(/\s+/g, '').trim();
    if (cleanedPhone.length < 7 || cleanedPhone.length > 20) {
      throw new BadRequestException('Invalid phone number');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { distributor: true },
    });
    if (!user?.distributor) throw new NotFoundException('Distributor missing');

    // Idempotency: once sponsor set, cannot change
    if (user.distributor.sponsorId && referralCode) {
      throw new ConflictException('Referral code already set — cannot be changed');
    }

    let sponsorId: string | null = user.distributor.sponsorId;

    if (referralCode && referralCode.trim()) {
      const code = referralCode.trim();
      const sponsor = await this.prisma.distributor.findUnique({
        where: { referralCode: code },
      });
      if (!sponsor) throw new BadRequestException('Invalid referral code');
      if (sponsor.id === user.distributor.id) {
        throw new BadRequestException('Cannot refer yourself');
      }
      sponsorId = sponsor.id;
    }

    // Are we attaching a sponsor for the first time? If so, we must also
    // populate MLMTreeNode. The ClerkGuard auto-provisions a bare
    // Distributor on first authenticated request (no sponsor, no tree
    // rows), so onboarding owns the responsibility of writing the tree.
    const attachingSponsor = !!sponsorId && !user.distributor.sponsorId;

    const updated = await this.prisma.$transaction(async (tx) => {
      const d = await tx.distributor.update({
        where: { id: user.distributor!.id },
        data: {
          phone: cleanedPhone,
          ...(name && name.trim() ? { name: name.trim() } : {}),
          ...(sponsorId ? { sponsorId } : {}),
        },
      });

      if (attachingSponsor) {
        // Safety: if stale tree rows somehow exist for this descendant,
        // wipe them before rebuilding. Normal case finds zero rows.
        await tx.mLMTreeNode.deleteMany({ where: { descendantId: d.id } });

        // Depth 1 = direct sponsor
        const ancestors: Array<{ ancestorId: string; depth: number }> = [
          { ancestorId: sponsorId!, depth: 1 },
        ];

        // Inherit all of sponsor's ancestors at +1 depth, capped at 15.
        const sponsorAncestors = await tx.mLMTreeNode.findMany({
          where: { descendantId: sponsorId! },
          select: { ancestorId: true, depth: true },
        });
        for (const a of sponsorAncestors) {
          const nextDepth = a.depth + 1;
          if (nextDepth > 15) continue;
          ancestors.push({ ancestorId: a.ancestorId, depth: nextDepth });
        }

        if (ancestors.length) {
          await tx.mLMTreeNode.createMany({
            data: ancestors.map((a) => ({
              ancestorId: a.ancestorId,
              descendantId: d.id,
              depth: a.depth,
            })),
            skipDuplicates: true,
          });
        }
      }

      return d;
    });

    return {
      userId: user.id,
      distributorId: updated.id,
      name: updated.name,
      phone: updated.phone,
      sponsorId: updated.sponsorId,
      referralCode: updated.referralCode,
      onboarded: true,
    };
  }
}
