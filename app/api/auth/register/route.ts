import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, email, phone, name, referralCode, password } = body;

    // Validation
    if (!memberId || !email || !phone || !name || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ memberId }, { email }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Find referrer
    let referredById = null;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { memberId: referralCode },
      });
      if (referrer) {
        referredById = referrer.id;
      }
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        memberId,
        email,
        phone,
        name,
        passwordHash,
        referredById,
      },
    });

    // Create wallet
    const wallet = await prisma.wallet.create({
      data: {
        userId: user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          userId: user.id,
          memberId: user.memberId,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}
