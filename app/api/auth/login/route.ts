import { NextResponse } from 'next/server';

// Login is now handled by Clerk. This route redirects to Clerk sign-in.
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Authentication is handled by Clerk. Use the sign-in UI.' },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.redirect(new URL('/sign-in', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
}
