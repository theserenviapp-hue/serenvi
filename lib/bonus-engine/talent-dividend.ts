import { prisma } from '../prisma';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

/**
 * Talent Dividend Bonus
 * Runs monthly
 * Distribution based on team sales performance
 */
export async function distributeTalentDividend() {
  const today = new Date();
  const lastMonth = subMonths(today, 1);
  const startOfLastMonth = startOfMonth(lastMonth);
  const endOfLastMonth = endOfMonth(lastMonth);

  console.log('[Talent Dividend] Starting monthly distribution...');

  try {
    // 1. Get all members with their team sales
    const members = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        wallet: true,
        referrals: {
          include: {
            products: {
              where: {
                purchasedAt: {
                  gte: startOfLastMonth,
                  lte: endOfLastMonth,
                },
              },
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    // 2. Calculate team sales for each member
    let totalTeamSales = 0;
    const memberSales = members.map((member) => {
      let teamSales = 0;

      // Calculate sales from direct referrals
      for (const referral of member.referrals) {
        for (const product of referral.products) {
          teamSales += product.product.price;
        }
      }

      if (teamSales > 0) {
        totalTeamSales += teamSales;
      }

      return {
        userId: member.id,
        teamSales,
        walletId: member.wallet?.id,
      };
    });

    console.log(`[Talent Dividend] Total team sales: ₹${totalTeamSales}`);

    if (totalTeamSales === 0) {
      console.log('[Talent Dividend] No team sales this month');
      return;
    }

    // 3. Distribute based on proportion
    const talentPool = totalTeamSales * 0.3; // 30% of team sales goes to talent dividend pool

    for (const member of memberSales) {
      if (member.teamSales > 0 && member.walletId) {
        const share = (member.teamSales / totalTeamSales) * talentPool;

        // Create bonus record
        await prisma.bonus.create({
          data: {
            userId: member.userId,
            type: 'TALENT_DIVIDEND',
            amount: share,
          },
        });

        // Credit wallet
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

        console.log(`[Talent Dividend] Credited ₹${share.toFixed(2)} to member ${member.userId}`);
      }
    }

    console.log('[Talent Dividend] Distribution complete');
  } catch (error) {
    console.error('[Talent Dividend] Error during distribution:', error);
    throw error;
  }
}
