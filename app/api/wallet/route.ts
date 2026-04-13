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

    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet not found' },
        { status: 404 }
      );
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
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wallet' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, type } = body;

    if (!userId || !amount || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet not found' },
        { status: 404 }
      );
    }

    let updateData = {};
    switch (type) {
      case 'Transfer topup to eWallet':
        if (wallet.topupWallet < amount) {
          return NextResponse.json(
            { success: false, error: 'Insufficient balance' },
            { status: 400 }
          );
        }
        updateData = {
          topupWallet: { decrement: amount },
          eWallet: { increment: amount },
        };
        break;
      case 'Top up':
        // In production, validate payment with Razorpay
        updateData = {
          topupWallet: { increment: amount },
        };
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid operation' },
          { status: 400 }
        );
    }

    const updatedWallet = await prisma.wallet.update({
      where: { userId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: {
        eWallet: updatedWallet.eWallet,
        topupWallet: updatedWallet.topupWallet,
        shoppingFund: updatedWallet.shoppingFund,
      },
    });
  } catch (error) {
    console.error('Error updating wallet:', error);
    return NextResponse.json(
      { success: false, error: 'Wallet update failed' },
      { status: 500 }
    );
  }
}
