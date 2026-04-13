import { NextResponse } from 'next/server';
import { requireDbUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await requireDbUser();

    const bonuses = await prisma.bonus.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: 200,
    });

    const summary = {
      fastTrack: 0,
      stepUp: 0,
      talentDividend: 0,
      leadership: 0,
      rank: 0,
      total: 0,
    };

    bonuses.forEach((bonus: { type: string; amount: number }) => {
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
        bonuses: bonuses.map((b: any) => ({
          id: b.id,
          type: b.type,
          amount: b.amount,
          date: b.date,
        })),
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching bonuses:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch bonuses' }, { status: 500 });
  }
}
