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

    const bonuses = await prisma.bonus.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    const summary = {
      fastTrack: 0,
      stepUp: 0,
      talentDividend: 0,
      leadership: 0,
      rank: 0,
      total: 0,
    };

    bonuses.forEach((bonus) => {
      if (bonus.type === 'FAST_TRACK') summary.fastTrack += bonus.amount;
      if (bonus.type === 'STEP_UP') summary.stepUp += bonus.amount;
      if (bonus.type === 'TALENT_DIVIDEND') summary.talentDividend += bonus.amount;
      if (bonus.type === 'LEADERSHIP') summary.leadership += bonus.amount;
      if (bonus.type === 'RANK') summary.rank += bonus.amount;
      summary.total += bonus.amount;
    });

    return NextResponse.json({
      success: true,
      data: {
        summary,
        bonuses: bonuses.map((b) => ({
          id: b.id,
          type: b.type,
          amount: b.amount,
          date: b.date,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching bonuses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bonuses' },
      { status: 500 }
    );
  }
}
