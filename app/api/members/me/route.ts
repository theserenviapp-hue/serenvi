import { NextResponse } from 'next/server';
import { requireDbUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireDbUser();

    // Lazy-load relations
    const { prisma } = await import('@/lib/prisma');
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        wallet: true,
        referrals: { select: { id: true } },
        products: { select: { id: true } },
        bonuses: { select: { amount: true } },
      },
    });

    if (!fullUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: fullUser.id,
        memberId: fullUser.memberId,
        name: fullUser.name,
        email: fullUser.email,
        phone: fullUser.phone,
        rank: fullUser.rank,
        status: fullUser.status,
        isAdmin: fullUser.isAdmin,
        wallet: fullUser.wallet,
        directReferrals: fullUser.referrals.length,
        totalPurchases: fullUser.products.length,
        totalBonuses: fullUser.bonuses.reduce((sum: number, b: { amount: number }) => sum + b.amount, 0),
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching member profile:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch profile' }, { status: 500 });
  }
}
