import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { distributeStepUpBonus } from '@/lib/bonus-engine/step-up';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productId, paymentMethod } = body;

    if (!userId || !productId || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user already owns this product
    const existingPurchase = await prisma.userProduct.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingPurchase) {
      return NextResponse.json(
        { success: false, error: 'You already own this product' },
        { status: 400 }
      );
    }

    // Create purchase record
    const purchase = await prisma.userProduct.create({
      data: {
        userId,
        productId,
        paidVia: paymentMethod,
      },
    });

    // Trigger Step Up bonus distribution (runs synchronously for demo)
    try {
      await distributeStepUpBonus(userId, product.price);
    } catch (error) {
      console.error('Error distributing Step Up bonus:', error);
      // Don't fail the purchase if bonus distribution fails
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          purchaseId: purchase.id,
          productName: product.name,
          price: product.price,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing product purchase:', error);
    return NextResponse.json(
      { success: false, error: 'Purchase failed' },
      { status: 500 }
    );
  }
}
