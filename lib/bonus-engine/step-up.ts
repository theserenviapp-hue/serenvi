import { prisma } from '../prisma';

/**
 * Step Up Bonus
 * Triggered on product purchase
 * Walk up the referral tree 25 levels with decreasing percentage rates
 */
export async function distributeStepUpBonus(purchaserId: string, productPrice: number) {
  const levelRates = [
    25, 5, 5, 5, 5, 5, 5, 5, 5, 5, // levels 1-10
    2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, // 11-20
    1, 1, 1, 1, 1, // 21-25
  ];

  console.log(`[Step Up] Processing Step Up bonus for purchase of ₹${productPrice}`);

  try {
    let currentUserId = purchaserId;

    for (let level = 0; level < levelRates.length; level++) {
      // Get the parent (referrer) of current user
      const parent = await prisma.user.findUnique({
        where: { id: currentUserId },
        select: { referredById: true },
      });

      if (!parent || !parent.referredById) {
        console.log(`[Step Up] Reached top of tree at level ${level + 1}`);
        break;
      }

      const parentId = parent.referredById;
      const bonusPercentage = levelRates[level];
      const bonusAmount = (productPrice * bonusPercentage) / 100;

      // Get parent's wallet
      const parentWallet = await prisma.wallet.findUnique({
        where: { userId: parentId },
      });

      if (parentWallet) {
        // Create bonus record
        await prisma.bonus.create({
          data: {
            userId: parentId,
            type: 'STEP_UP',
            amount: bonusAmount,
          },
        });

        // Credit wallet
        await prisma.wallet.update({
          where: { id: parentWallet.id },
          data: {
            eWallet: {
              increment: bonusAmount,
            },
            totalEarning: {
              increment: bonusAmount,
            },
          },
        });

        console.log(
          `[Step Up] Level ${level + 1}: Credited ₹${bonusAmount.toFixed(2)} to ${parentId}`
        );
      }

      currentUserId = parentId;
    }

    console.log('[Step Up] Distribution complete');
  } catch (error) {
    console.error('[Step Up] Error during distribution:', error);
    throw error;
  }
}
