import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { distributeFastTrackBonus } from '@/lib/bonus-engine/fast-track';

const VALID_BONUS_TYPES = ['FAST_TRACK', 'TALENT_DIVIDEND', 'STEP_UP'] as const;

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { bonusType } = body;

    if (!bonusType || !VALID_BONUS_TYPES.includes(bonusType)) {
      return NextResponse.json(
        { success: false, error: `Invalid bonus type. Valid: ${VALID_BONUS_TYPES.join(', ')}` },
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
      { success: false, error: 'Bonus type not yet implemented' },
      { status: 400 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 });
    }
    console.error('Error distributing bonuses:', error);
    return NextResponse.json({ success: false, error: 'Bonus distribution failed' }, { status: 500 });
  }
}
