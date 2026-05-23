/**
 * One-shot data hygiene pass.
 *
 *   1. Normalize Product.sizes — the first CSV import dumped the
 *      "Size/Color Variants" field into sizes, so many rows contain colour
 *      tokens ("offwhite", "bluebeige") instead of real sizes. This rewrites
 *      those rows with sensible defaults based on category + gender.
 *
 *   2. Backfill Distributor.referralCode for anyone still holding a legacy
 *      cuid (25 chars). Clerk-provisioned users got cuids before the guard
 *      was fixed to emit a short 6-char code.
 *
 * Usage:
 *   cd backend
 *   DATABASE_URL="<session-pooler URL>" npx ts-node scripts/repair-data.ts --dry
 *   DATABASE_URL="<session-pooler URL>" npx ts-node scripts/repair-data.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DRY = process.argv.includes('--dry');

const CLOTHING = new Set(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'FREE']);
const isRealSize = (t: string) =>
  CLOTHING.has(t.toUpperCase()) || /^\d{1,2}(\.\d)?$/.test(t);

function defaultSizes(category: string | null, gender: string | null): string | null {
  const cat = (category || '').toLowerCase();
  if (/foot|shoe|sandal|sneaker|heel|loafer|boot/.test(cat)) {
    return /men|male/i.test(gender || '') ? '7, 8, 9, 10, 11' : '4, 5, 6, 7, 8';
  }
  if (/home|living|kitchen|decor|lamp|bag|wallet|accessor|jewel|watch|beauty|cosmet/.test(cat)) {
    return null; // no size concept
  }
  return /men|male/i.test(gender || '') ? 'S, M, L, XL, XXL' : 'S, M, L, XL';
}

/* Short, human-shareable 6-char referral code (no 0/O/1/I look-alikes). */
function newCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}
async function uniqueCode(): Promise<string> {
  for (let i = 0; i < 15; i++) {
    const c = newCode();
    const clash = await prisma.distributor.findUnique({ where: { referralCode: c } });
    if (!clash) return c;
  }
  return newCode() + newCode().slice(0, 2);
}

async function repairSizes() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, sizes: true, category: true, gender: true },
  });

  let fixed = 0;
  let ok = 0;

  for (const p of products) {
    const tokens = (p.sizes || '').split(',').map((s) => s.trim()).filter(Boolean);
    const looksLikeSizes = tokens.length > 0 && tokens.every(isRealSize);
    if (looksLikeSizes) { ok++; continue; }

    const fallback = defaultSizes(p.category, p.gender);
    console.log(`[sizes] ${p.name}  ::  "${p.sizes}"  ->  "${fallback ?? '(null)'}"`);
    if (DRY) continue;

    await prisma.product.update({
      where: { id: p.id },
      data: { sizes: fallback },
    });
    fixed++;
  }

  console.log('');
  console.log(`[sizes] already-valid: ${ok}`);
  console.log(`[sizes] ${DRY ? 'would-fix' : 'fixed'}: ${fixed}`);
}

async function repairReferralCodes() {
  const candidates = await prisma.distributor.findMany({
    where: { referralCode: { not: null } },
    select: { id: true, name: true, referralCode: true, createdAt: true },
  });

  let fixed = 0;
  let ok = 0;

  for (const d of candidates) {
    const code = d.referralCode || '';
    // Legacy cuid looks like c<24 chars>. Anything longer than 8 is wrong.
    if (code.length <= 8 && /^[A-Z0-9]+$/.test(code)) { ok++; continue; }

    const next = await uniqueCode();
    console.log(`[ref]   ${d.name || d.id}  ::  ${code}  ->  ${next}`);
    if (DRY) continue;

    await prisma.distributor.update({
      where: { id: d.id },
      data: { referralCode: next },
    });
    fixed++;
  }

  console.log('');
  console.log(`[ref]   already-ok:   ${ok}`);
  console.log(`[ref]   ${DRY ? 'would-fix' : 'fixed'}:       ${fixed}`);
}

async function main() {
  console.log(`Mode: ${DRY ? 'DRY RUN (no writes)' : 'LIVE'}\n`);
  await repairSizes();
  console.log('');
  await repairReferralCodes();
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
