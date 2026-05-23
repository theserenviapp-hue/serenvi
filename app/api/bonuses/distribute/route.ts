import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { distributeFastTrackBonus } from '@/lib/bonus-engine/fast-track';

export async function POST(request: NextRequest) {
  try {
    // Check admin authorization (simplified)
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bonusType } = body;

    if (!bonusType) {
      return NextResponse.json(
        { success: false, error: 'Missing bonusType' },
        { status: 400 }
      );
    }

    if (bonusType === 'FAST_TRACK') {
      await distributeFastTrackBonus();
      return NextResponse.json({
        success: true,
        message: 'Fast Track bonus distribution completed',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid bonus type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error distributing bonuses:', error);
    return NextResponse.json(
      { success: false, error: 'Bonus distribution failed' },
      { status: 500 }
    );
  }
}
