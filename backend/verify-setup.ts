#!/usr/bin/env node

/**
 * Verify Products and Admin Status
 * 
 * This script checks:
 * 1. Are there any products in the database?
 * 2. Is the admin user properly configured?
 * 3. Can we connect to the database?
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Checking database connection...');
    
    // Test connection
    const users = await prisma.user.findMany({ take: 1 });
    console.log('✅ Database connection successful');
    
    // Check product count
    console.log('\n📦 Checking products...');
    const productCount = await prisma.product.count();
    console.log(`Total products in database: ${productCount}`);
    
    if (productCount === 0) {
      console.log('⚠️  WARNING: No products found! Run seed script to import products:');
      console.log('   cd backend && DATABASE_URL="<session-pooler-url>" npx ts-node scripts/import-ajio-products.ts');
    } else {
      const activeProducts = await prisma.product.count({
        where: { isActive: true },
      });
      console.log(`Active products: ${activeProducts}`);
      
      // Show sample products
      const samples = await prisma.product.findMany({ 
        take: 5,
        where: { isActive: true },
      });
      console.log('\n📋 Sample products:');
      samples.forEach(p => {
        console.log(`  - ${p.name} ($${p.price}) - ${p.category}`);
      });
    }
    
    // Check admin users
    console.log('\n👤 Checking admin users...');
    const adminCount = await prisma.user.count({
      where: { isAdmin: true },
    });
    console.log(`Admin users: ${adminCount}`);
    
    if (adminCount === 0) {
      console.log('⚠️  WARNING: No admin users found!');
      console.log('   To make a user admin, run: npm run make-admin <user-id>');
    } else {
      const admins = await prisma.user.findMany({
        where: { isAdmin: true },
        select: { id: true, email: true, clerkUserId: true },
      });
      console.log('\n🔐 Admin users:');
      admins.forEach(a => {
        console.log(`  - ${a.email} (ID: ${a.id})`);
        if (a.clerkUserId) {
          console.log(`    Clerk ID: ${a.clerkUserId}`);
        } else {
          console.log(`    ⚠️  WARNING: No Clerk ID linked!`);
        }
      });
    }
    
    // Check total users
    console.log('\n👥 Total users in database:');
    const totalUsers = await prisma.user.count();
    console.log(`${totalUsers} users`);
    
    console.log('\n✅ Verification complete!');
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
