import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
        referrals: true,
        products: true,
        bonuses: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        memberId: user.memberId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        rank: user.rank,
        status: user.status,
        wallet: user.wallet,
        directReferrals: user.referrals.length,
        totalPurchases: user.products.length,
        totalBonuses: user.bonuses.reduce((sum, b) => sum + b.amount, 0),
      },
    });
  } catch (error) {
    console.error('Error fetching member profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
