import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const matches = await prisma.product.findMany({
    where: { name: { contains: 'Lulu', mode: 'insensitive' } },
    select: { id: true, name: true, imageUrl: true },
  });
  console.log('Found:', matches.length);
  matches.forEach((m) => console.log(m));

  // Correct URL (raw, percent-encoded)
  const correctUrl =
    'https://assets.ajio.com/medias/sys_master/root1/20250829/6C9Z/68b166708bfb9009acb85f5e/lulu_%26_sky_white_women_off-shoulder_sheath_dress.jpg';

  for (const m of matches) {
    if (m.imageUrl !== correctUrl) {
      await prisma.product.update({
        where: { id: m.id },
        data: { imageUrl: correctUrl },
      });
      console.log(`Updated ${m.name}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
