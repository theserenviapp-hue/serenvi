import { NextRequest, NextResponse } from 'next/server';
import { requireDbUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await requireDbUser();

    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.id },
    });

    if (!wallet) {
      return NextResponse.json({ success: false, error: 'Wallet not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        eWallet: wallet.eWallet,
        topupWallet: wallet.topupWallet,
        shoppingFund: wallet.shoppingFund,
        totalEarning: wallet.totalEarning,
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching wallet:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch wallet' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireDbUser();
    const body = await request.json();
    const { amount, type } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 });
    }

    if (amount > 1000000) {
      return NextResponse.json({ success: false, error: 'Amount exceeds maximum limit' }, { status: 400 });
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.id },
    });

    if (!wallet) {
      return NextResponse.json({ success: false, error: 'Wallet not found' }, { status: 404 });
    }

    const VALID_TYPES = ['Transfer topup to eWallet', 'Top up'] as const;
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ success: false, error: 'Invalid operation type' }, { status: 400 });
    }

    // Use transaction for atomicity
    const updatedWallet = await prisma.$transaction(async (tx: any) => {
      const currentWallet = await tx.wallet.findUnique({
        where: { userId: user.id },
      });

      if (!currentWallet) throw new Error('Wallet not found');

      if (type === 'Transfer topup to eWallet') {
        if (currentWallet.topupWallet < amount) {
          throw new Error('Insufficient balance');
        }
        return tx.wallet.update({
          where: { userId: user.id },
          data: {
            topupWallet: { decrement: amount },
            eWallet: { increment: amount },
          },
        });
      }

      // Top up — in production, validate payment with Razorpay first
      return tx.wallet.update({
        where: { userId: user.id },
        data: { topupWallet: { increment: amount } },
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        eWallet: updatedWallet.eWallet,
        topupWallet: updatedWallet.topupWallet,
        shoppingFund: updatedWallet.shoppingFund,
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Insufficient balance') {
      return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 });
    }
    console.error('Error updating wallet:', error);
    return NextResponse.json({ success: false, error: 'Wallet update failed' }, { status: 500 });
  }
}
