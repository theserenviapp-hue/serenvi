#!/bin/sh
# Production startup script with robust migration handling

echo "🚀 Starting SERENVI Backend..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  WARNING: DATABASE_URL is not set - skipping migrations"
  echo "DATABASE_URL value: (empty)"
  node dist/main
  exit $?
fi

if [ -z "$DIRECT_URL" ]; then
  echo "⚠️  WARNING: DIRECT_URL is not set - migrations may fail"
fi

echo "📡 DATABASE_URL is set (length: ${#DATABASE_URL})"
echo "📡 DIRECT_URL is set: $([ -z "$DIRECT_URL" ] && echo "NO" || echo "YES")"
echo "📡 NODE_ENV: ${NODE_ENV:-not set}"
echo "📡 Attempting database migrations..."

# Try to run migrations with retry logic
MAX_RETRIES=3
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  RETRY_COUNT=$(($RETRY_COUNT + 1))
  echo ""
  echo "🔄 Migration attempt $RETRY_COUNT/$MAX_RETRIES..."
  
  # Run migration with full output
  if npx prisma migrate deploy --skip-generate 2>&1; then
    echo "✅ Migrations completed successfully"
    break
  else
    MIGRATION_EXIT=$?
    echo "❌ Prisma migrate failed with exit code $MIGRATION_EXIT"
    
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
      echo "⏳ Retrying in 10 seconds..."
      sleep 10
    else
      echo "⚠️  Migrations failed after $MAX_RETRIES attempts"
      echo "⚠️  Attempting to continue anyway..."
    fi
  fi
done

echo ""
echo "✅ Starting NestJS application..."
node dist/main
exit $?
