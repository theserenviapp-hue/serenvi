import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from './prisma';

/**
 * Get the authenticated user's database record.
 * Links Clerk userId to our User table via clerkId field.
 * Throws if not authenticated.
 */
export async function getAuthUser() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  return { clerkUserId: userId, user };
}

/**
 * Get authenticated user or return null (no throw).
 */
export async function getOptionalAuthUser() {
  try {
    return await getAuthUser();
  } catch {
    return null;
  }
}

/**
 * Require user to exist in DB. If not, create from Clerk profile.
 */
export async function requireDbUser() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { wallet: true },
  });

  if (!user) {
    const clerkUser = await currentUser();
    if (!clerkUser) throw new Error('Unauthorized');

    user = await prisma.user.create({
      data: {
        clerkId: userId,
        memberId: `USR${Date.now()}`,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        phone: clerkUser.phoneNumbers[0]?.phoneNumber || '',
      },
      include: { wallet: true },
    });

    if (!user.wallet) {
      await prisma.wallet.create({ data: { userId: user.id } });
      user = await prisma.user.findUnique({
        where: { id: user.id },
        include: { wallet: true },
      });
    }
  }

  return user!;
}

/**
 * Check if the authenticated user is an admin.
 * Uses Clerk publicMetadata.role === 'admin'.
 */
export async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const role = (sessionClaims as any)?.metadata?.role;
  if (role !== 'admin') {
    throw new Error('Admin access required');
  }

  return { userId };
}
