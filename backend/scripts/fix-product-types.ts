import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixProductTypes() {
  try {
    console.log('Fixing product types...');
    
    // Update all products where type is not PHYSICAL or DIGITAL to PHYSICAL
    const result = await prisma.product.updateMany({
      where: {
        AND: [
          { type: { not: 'PHYSICAL' } },
          { type: { not: 'DIGITAL' } }
        ]
      },
      data: {
        type: 'PHYSICAL'
      }
    });

    console.log(`Updated ${result.count} products to PHYSICAL type`);

    // Verify the fix
    const stats = await prisma.product.groupBy({
      by: ['type'],
      _count: { type: true },
    });

    console.log('\nProduct type distribution:');
    stats.forEach(stat => {
      console.log(`${stat.type}: ${stat._count.type}`);
    });

    // Also show gender distribution
    const genderStats = await prisma.product.groupBy({
      by: ['gender'],
      _count: { gender: true },
    });

    console.log('\nGender distribution:');
    genderStats.forEach(stat => {
      console.log(`${stat.gender}: ${stat._count.gender}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductTypes();
