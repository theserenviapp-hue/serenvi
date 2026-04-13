import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, deletedAt: null },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        fileUrl: true,
      },
      take: 200,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { name, description, price, fileUrl } = body;

    // Input validation
    if (!name || typeof name !== 'string' || name.length > 200) {
      return NextResponse.json({ success: false, error: 'Invalid product name' }, { status: 400 });
    }
    if (typeof price !== 'number' || price <= 0 || price > 10000000) {
      return NextResponse.json({ success: false, error: 'Invalid price' }, { status: 400 });
    }
    if (!fileUrl || typeof fileUrl !== 'string') {
      return NextResponse.json({ success: false, error: 'File URL required' }, { status: 400 });
    }

    // Validate URL format
    try {
      const url = new URL(fileUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return NextResponse.json({ success: false, error: 'Only HTTP/HTTPS URLs allowed' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid URL format' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price,
        fileUrl,
      },
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Admin access required' || error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 });
  }
}
