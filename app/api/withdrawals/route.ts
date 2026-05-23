import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, bankDetails } = body;

    if (!userId || !amount || !bankDetails) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (amount < 100) {
      return NextResponse.json(
        { success: false, error: 'Minimum withdrawal amount is ₹100' },
        { status: 400 }
      );
    }

    // Get wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet not found' },
        { status: 404 }
      );
    }

    if (wallet.eWallet < amount) {
      return NextResponse.json(
        { success: false, error: 'Insufficient eWallet balance' },
        { status: 400 }
      );
    }

    // Calculate net amount (after 5% charge)
    const charge = amount * 0.05;
    const netAmount = amount - charge;

    // Create withdrawal request
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId,
        amount,
        netAmount,
        bankDetails,
      },
    });

    // Deduct from wallet
    await prisma.wallet.update({
      where: { userId },
      data: {
        eWallet: { decrement: amount },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          withdrawalId: withdrawal.id,
          amount,
          netAmount,
          charge,
          status: withdrawal.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    return NextResponse.json(
      { success: false, error: 'Withdrawal request failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId' },
        { status: 400 }
      );
    }

    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: withdrawals,
    });
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch withdrawals' },
      { status: 500 }
    );
  }
}
