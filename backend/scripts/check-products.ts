import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const maleCount = await prisma.product.count({ where: { gender: 'Male' } });
  const femaleCount = await prisma.product.count({ where: { gender: 'Female' } });
  const totalCount = await prisma.product.count();

  console.log('\n=== Product Summary ===');
  console.log('Total Products:', totalCount);
  console.log('Male Products: ', maleCount);
  console.log('Female Products:', femaleCount);

  console.log('\nSample Male Products:');
  const males = await prisma.product.findMany({ 
    where: { gender: 'Male' }, 
    take: 5,
    select: { name: true, price: true, gender: true }
  });
  males.forEach(p => console.log('  - ' + p.name.substring(0, 45) + ' - ₹' + p.price));

  console.log('\nSample Female Products:');
  const females = await prisma.product.findMany({ 
    where: { gender: 'Female' }, 
    take: 5,
    select: { name: true, price: true, gender: true }
  });
  females.forEach(p => console.log('  - ' + p.name.substring(0, 45) + ' - ₹' + p.price));

  await prisma.$disconnect();
}

main().catch(console.error);
