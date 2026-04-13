import { prisma } from '../prisma';

/**
 * Distribute Fast Track Bonus
 * 40% of daily product sales distributed based on multiplier system
 * Eligible: members with 3+ direct referrals who purchased
 */
export async function distributeFastTrackBonus() {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

  console.log('[Fast Track] Starting daily distribution...');

  try {
    // 1. Get total product sales value for today
    const todaySales = await prisma.userProduct.aggregate({
      where: {
        purchasedAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      _sum: {
        product: {
          price: true,
        },
      },
    });

    const totalSalesValue = todaySales._sum.product?.price || 0;
    const fastTrackPool = totalSalesValue * 0.4; // 40% goes to fast track pool

    console.log(`[Fast Track] Total sales: ${totalSalesValue}, Pool: ${fastTrackPool}`);

    if (fastTrackPool === 0) {
      console.log('[Fast Track] No sales today, skipping distribution');
      return;
    }

    // 2. Get all eligible members (3+ direct referrals who purchased)
    const eligible = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        referrals: {
          where: {
            products: {
              some: {},
            },
          },
        },
        wallet: true,
      },
    });

    const eligibleMembers = eligible.filter((user: any) => user.referrals.length >= 3);

    if (eligibleMembers.length === 0) {
      console.log('[Fast Track] No eligible members');
      return;
    }

    console.log(`[Fast Track] ${eligibleMembers.length} eligible members`);

    // 3. Calculate weighted units and each member's share
    // multiplier = 3 (base) + (directReferrals - 3) for each extra direct
    let totalWeightedUnits = 0;
    const memberWeights = eligibleMembers.map((member: any) => {
      // Assume each user has a packageAmount (for simplicity, using fixed amount)
      const packageAmount = 299; // Standard product price
      const directCount = member.referrals.length;
      const multiplier = 3 + Math.max(0, directCount - 3);
      const weightedUnits = packageAmount * multiplier;

      totalWeightedUnits += weightedUnits;

      return {
        userId: member.id,
        packageAmount,
        multiplier,
        weightedUnits,
        walletId: member.wallet?.id,
      };
    });

    // 4. Distribute bonuses
    for (const member of memberWeights) {
      const share = (member.weightedUnits / totalWeightedUnits) * fastTrackPool;

      // Create bonus record
      await prisma.bonus.create({
        data: {
          userId: member.userId,
          type: 'FAST_TRACK',
          amount: share,
        },
      });

      // Credit wallet
      if (member.walletId) {
        await prisma.wallet.update({
          where: { id: member.walletId },
          data: {
            eWallet: {
              increment: share,
            },
            totalEarning: {
              increment: share,
            },
          },
        });
      }

      console.log(`[Fast Track] Credited ${share.toFixed(2)} to member ${member.userId}`);
    }

    console.log('[Fast Track] Distribution complete');
  } catch (error) {
    console.error('[Fast Track] Error during distribution:', error);
    throw error;
  }
}
