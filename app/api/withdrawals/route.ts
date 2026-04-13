import { NextRequest, NextResponse } from 'next/server';
import { requireDbUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const MIN_WITHDRAWAL = 100;
const MAX_WITHDRAWAL = 500000;
const WITHDRAWAL_CHARGE_RATE = 0.05;

export async function POST(request: NextRequest) {
  try {
    const user = await requireDbUser();
    const body = await request.json();
    const { amount, bankDetails } = body;

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount < MIN_WITHDRAWAL) {
      return NextResponse.json(
        { success: false, error: `Minimum withdrawal amount is ₹${MIN_WITHDRAWAL}` },
        { status: 400 }
      );
    }

    if (amount > MAX_WITHDRAWAL) {
      return NextResponse.json(
        { success: false, error: `Maximum withdrawal amount is ₹${MAX_WITHDRAWAL}` },
        { status: 400 }
      );
    }

    // Validate bank details
    if (!bankDetails || !bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.accountHolder) {
      return NextResponse.json(
        { success: false, error: 'Complete bank details required' },
        { status: 400 }
      );
    }

    if (!IFSC_REGEX.test(bankDetails.ifscCode.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: 'Invalid IFSC code format' },
        { status: 400 }
      );
    }

    if (bankDetails.accountNumber.length < 8 || bankDetails.accountNumber.length > 18) {
      return NextResponse.json(
        { success: false, error: 'Invalid account number' },
        { status: 400 }
      );
    }

    // Use Prisma decimal math to avoid floating point issues
    const charge = Math.round(amount * WITHDRAWAL_CHARGE_RATE * 100) / 100;
    const netAmount = Math.round((amount - charge) * 100) / 100;

    // Atomic transaction: create withdrawal + deduct from wallet
    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId: user.id } });
      if (!wallet) throw new Error('Wallet not found');
      if (wallet.eWallet < amount) throw new Error('Insufficient balance');

      const withdrawal = await tx.withdrawal.create({
        data: {
          userId: user.id,
          amount,
          netAmount,
          bankDetails: {
            accountNumber: bankDetails.accountNumber,
            ifscCode: bankDetails.ifscCode.toUpperCase(),
            accountHolder: bankDetails.accountHolder,
          },
        },
      });

      await tx.wallet.update({
        where: { userId: user.id },
        data: { eWallet: { decrement: amount } },
      });

      return withdrawal;
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          withdrawalId: result.id,
          amount,
          netAmount,
          charge,
          status: result.status,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Insufficient balance') {
      return NextResponse.json({ success: false, error: 'Insufficient eWallet balance' }, { status: 400 });
    }
    console.error('Error processing withdrawal:', error);
    return NextResponse.json({ success: false, error: 'Withdrawal request failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await requireDbUser();

    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, data: withdrawals });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching withdrawals:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch withdrawals' }, { status: 500 });
  }
}
