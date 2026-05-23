/**
 * Repairs MLMTreeNode rows for Distributors whose sponsorId is set but whose
 * tree nodes were never inserted (bug: onboarding path prior to 2026-04-16
 * didn't populate the tree after attaching a sponsor).
 *
 * Run once after deploy:
 *   cd backend
 *   DATABASE_URL="<direct / session-pooler URL>" npx ts-node scripts/repair-mlm-tree.ts
 *
 * Pass `--dry` to just print what would change.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DRY = process.argv.includes('--dry');

async function main() {
  const sponsored = await prisma.distributor.findMany({
    where: { sponsorId: { not: null } },
    select: { id: true, name: true, sponsorId: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`[repair] ${sponsored.length} distributors with a sponsor set`);

  let fixed = 0;
  let alreadyOk = 0;
  let skipped = 0;

  for (const d of sponsored) {
    const sponsorId = d.sponsorId!;

    // Is there a depth=1 row linking sponsor -> this distributor?
    const direct = await prisma.mLMTreeNode.findFirst({
      where: { ancestorId: sponsorId, descendantId: d.id, depth: 1 },
      select: { id: true },
    });
    if (direct) {
      alreadyOk++;
      continue;
    }

    // Build the ancestor list (self first at depth 1, then inherit).
    const ancestors: Array<{ ancestorId: string; depth: number }> = [
      { ancestorId: sponsorId, depth: 1 },
    ];
    const sponsorAncestors = await prisma.mLMTreeNode.findMany({
      where: { descendantId: sponsorId },
      select: { ancestorId: true, depth: true },
    });
    for (const a of sponsorAncestors) {
      const nd = a.depth + 1;
      if (nd > 15) continue;
      ancestors.push({ ancestorId: a.ancestorId, depth: nd });
    }

    console.log(
      `[repair] ${d.name || d.id} ← sponsor=${sponsorId} :: ` +
        `${ancestors.length} row(s) to insert`,
    );
    if (DRY) { skipped++; continue; }

    // Defensive wipe of any stray rows for this descendant, then create.
    await prisma.$transaction([
      prisma.mLMTreeNode.deleteMany({ where: { descendantId: d.id } }),
      prisma.mLMTreeNode.createMany({
        data: ancestors.map((a) => ({
          ancestorId: a.ancestorId,
          descendantId: d.id,
          depth: a.depth,
        })),
        skipDuplicates: true,
      }),
    ]);
    fixed++;
  }

  console.log('');
  console.log(`[repair] already-ok:  ${alreadyOk}`);
  console.log(`[repair] fixed:       ${fixed}`);
  console.log(`[repair] dry-skipped: ${skipped}`);
  if (DRY) console.log('[repair] DRY RUN — nothing written');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
