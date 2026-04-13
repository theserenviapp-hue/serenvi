import { NextRequest, NextResponse } from 'next/server';
import { requireDbUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { distributeStepUpBonus } from '@/lib/bonus-engine/step-up';

export async function POST(request: NextRequest) {
  try {
    const user = await requireDbUser();
    const body = await request.json();
    const { productId, paymentMethod } = body;

    if (!productId || !paymentMethod) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const VALID_PAY_METHODS = ['BANK', 'WALLET', 'ADMIN_FREE'];
    if (!VALID_PAY_METHODS.includes(paymentMethod)) {
      return NextResponse.json({ success: false, error: 'Invalid payment method' }, { status: 400 });
    }

    // Atomic: check product + check duplicate + create purchase
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product || !product.isActive) {
        throw new Error('Product not found');
      }

      // Unique constraint handles race condition
      const purchase = await tx.userProduct.create({
        data: {
          userId: user.id,
          productId,
          paidVia: paymentMethod,
        },
      });

      return { purchase, product };
    });

    // Non-critical: bonus distribution (don't fail purchase)
    try {
      await distributeStepUpBonus(user.id, result.product.price);
    } catch (err) {
      console.error('Error distributing Step Up bonus:', err);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          purchaseId: result.purchase.id,
          productName: result.product.name,
          price: result.product.price,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Product not found') {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    // Prisma unique constraint violation = already purchased
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'You already own this product' }, { status: 400 });
    }
    console.error('Error processing purchase:', error);
    return NextResponse.json({ success: false, error: 'Purchase failed' }, { status: 500 });
  }
}
