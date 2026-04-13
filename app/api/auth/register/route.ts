import { NextResponse } from 'next/server';

// Registration is now handled by Clerk. This route is deprecated.
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Registration is handled by Clerk. Use the sign-up UI.' },
    { status: 410 }
  );
}
