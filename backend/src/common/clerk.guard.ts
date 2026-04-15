import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { verifyToken } from '@clerk/backend';
import { PrismaService } from '../database/prisma.service';

/**
 * ClerkGuard — verifies Clerk JWT and populates req.user with internal IDs.
 *
 * On every protected request:
 *   1. Verify Bearer token against Clerk.
 *   2. Look up local User by clerkUserId (linked via clerkUserId column).
 *   3. If not found, auto-provision: create User + linked Distributor with defaults.
 *   4. Populate req.user = { userId, distributorId, email, isAdmin } so existing
 *      controllers/services that read req.user keep working without changes.
 */
@Injectable()
export class ClerkGuard implements CanActivate {
  private readonly logger = new Logger(ClerkGuard.name);

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or malformed Authorization header');
    }

    const token = authHeader.substring('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedException('Empty bearer token');
    }

    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      this.logger.error('CLERK_SECRET_KEY not set');
      throw new UnauthorizedException('Server auth misconfigured');
    }

    let clerkUserId: string;
    let clerkEmail: string | undefined;

    try {
      const payload = await verifyToken(token, { secretKey });
      clerkUserId = (payload as any).sub;
      clerkEmail =
        (payload as any).email ||
        (payload as any).primary_email_address ||
        (payload as any).email_address ||
        undefined;

      if (!clerkUserId) throw new Error('Token missing sub');

      request.clerkUserId = clerkUserId;
      request.clerkEmail = clerkEmail;
      request.clerkSessionId = (payload as any).sid;
    } catch (err: any) {
      this.logger.warn(`Clerk token verification failed: ${err?.message || err}`);
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Resolve or auto-provision local user
    let user = await this.prisma.user.findUnique({
      where: { clerkUserId },
      include: { distributor: true },
    });

    if (!user) {
      // Auto-provision on first seen Clerk user
      const email = clerkEmail || `${clerkUserId}@clerk.local`;
      const placeholderName = email.split('@')[0] || 'User';

      user = await this.prisma.$transaction(async (tx) => {
        // Guard against email collision (existing user from legacy /auth/register flow)
        const existingByEmail = await tx.user.findUnique({ where: { email } });
        if (existingByEmail) {
          // Link the existing account to this Clerk ID
          const linked = await tx.user.update({
            where: { id: existingByEmail.id },
            data: { clerkUserId },
            include: { distributor: true },
          });
          return linked;
        }

        const created = await tx.user.create({
          data: {
            email,
            password: '', // Clerk manages auth; local password unused
            clerkUserId,
            distributor: {
              create: {
                name: placeholderName,
                phone: '',
                email,
              },
            },
          },
          include: { distributor: true },
        });
        return created;
      });
    }

    request.user = {
      userId: user.id,
      distributorId: user.distributor?.id,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    return true;
  }
}
