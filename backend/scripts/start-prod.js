#!/usr/bin/env node
/**
 * Production startup script with robust migration handling
 * Runs Prisma migrations before starting the NestJS app
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting SERENVI Backend...\n');

// Check environment variables
const databaseUrl = process.env.DATABASE_URL;
const directUrl = process.env.DIRECT_URL;
const nodeEnv = process.env.NODE_ENV || 'development';

console.log('📋 Environment Check:');
console.log(`  - NODE_ENV: ${nodeEnv}`);
console.log(`  - DATABASE_URL: ${databaseUrl ? '✅ SET' : '❌ NOT SET'}`);
console.log(`  - DIRECT_URL: ${directUrl ? '✅ SET' : '❌ NOT SET'}`);
console.log();

if (!databaseUrl) {
  console.warn('⚠️  DATABASE_URL is not set - skipping migrations');
  console.log('⏳ Starting app without database...\n');
  require('./dist/main');
  return;
}

// Run migrations with retry logic
const MAX_RETRIES = 3;
let retryCount = 0;
let migrationSuccess = false;

async function runMigrations() {
  while (retryCount < MAX_RETRIES && !migrationSuccess) {
    retryCount++;
    console.log(`🔄 Migration attempt ${retryCount}/${MAX_RETRIES}...\n`);

    try {
      // Run migration with full output
      execSync('npx prisma migrate deploy', {
        stdio: 'inherit',
        env: { ...process.env }
      });
      console.log('\n✅ Migrations completed successfully\n');
      migrationSuccess = true;
    } catch (error) {
      console.error(`\n❌ Migration attempt ${retryCount} failed with exit code ${error.status}`);
      
      if (retryCount < MAX_RETRIES) {
        const waitSeconds = 10;
        console.log(`⏳ Waiting ${waitSeconds}s before retry...\n`);
        await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
      } else {
        console.warn(`⚠️  Migrations failed after ${MAX_RETRIES} attempts`);
        console.warn('⚠️  Attempting to start app anyway - database may be in inconsistent state\n');
      }
    }
  }
}

// Start the application
runMigrations().then(() => {
  console.log('✅ Starting NestJS application...\n');
  require('./dist/main');
}).catch((error) => {
  console.error('❌ Fatal error during startup:', error);
  process.exit(1);
});
