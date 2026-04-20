/**
 * Re-classify products whose name contains "Women" but gender says Male.
 * Also handle "Men" in name misclassified as Female (defensive).
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Case 1: name mentions women/ladies/girls but gender=Male -> Female
  const wrongMale = await prisma.product.findMany({
    where: {
      gender: 'Male',
      OR: [
        { name: { contains: 'women', mode: 'insensitive' } },
        { name: { contains: "women's", mode: 'insensitive' } },
        { name: { contains: 'ladies', mode: 'insensitive' } },
        { name: { contains: 'girls', mode: 'insensitive' } },
      ],
    },
    select: { id: true, name: true, gender: true },
  });
  console.log(`Found ${wrongMale.length} products: named Women but gender=Male`);

  for (const p of wrongMale) {
    await prisma.product.update({
      where: { id: p.id },
      data: { gender: 'Female' },
    });
  }
  console.log(`→ Updated ${wrongMale.length} to Female`);

  // Case 2: name mentions men but gender=Female (skip if also contains women)
  const wrongFemale = await prisma.product.findMany({
    where: {
      gender: 'Female',
      AND: [
        {
          OR: [
            { name: { contains: "men's", mode: 'insensitive' } },
            { name: { startsWith: 'Men ', mode: 'insensitive' } },
            { name: { contains: ' men ', mode: 'insensitive' } },
          ],
        },
        { NOT: { name: { contains: 'women', mode: 'insensitive' } } },
      ],
    },
    select: { id: true, name: true },
  });
  console.log(`\nFound ${wrongFemale.length} products: named Men but gender=Female`);
  for (const p of wrongFemale) {
    await prisma.product.update({ where: { id: p.id }, data: { gender: 'Male' } });
  }
  console.log(`→ Updated ${wrongFemale.length} to Male`);

  // Summary
  const counts = await prisma.product.groupBy({
    by: ['gender'],
    _count: true,
  });
  console.log('\nFinal gender distribution:');
  counts.forEach((c) => console.log(`  ${c.gender || '(null)'}: ${c._count}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
