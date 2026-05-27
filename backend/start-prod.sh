#!/bin/sh
# Production startup script with robust migration handling

set -e

echo "🚀 Starting SERENVI Backend..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  WARNING: DATABASE_URL is not set - skipping migrations"
  exec node dist/main
fi

echo "📡 Attempting database migrations..."

# Try to run migrations with retry logic
MAX_RETRIES=3
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  echo "Migration attempt $(($RETRY_COUNT + 1))/$MAX_RETRIES..."
  
  if npx prisma migrate deploy --skip-generate; then
    echo "✅ Migrations completed successfully"
    break
  else
    RETRY_COUNT=$(($RETRY_COUNT + 1))
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
      echo "⚠️  Migration failed, retrying in 5 seconds..."
      sleep 5
    else
      echo "❌ Migrations failed after $MAX_RETRIES attempts"
      echo "⚠️  Starting app anyway - database may be in inconsistent state"
    fi
  fi
done

echo "✅ Starting NestJS application..."
exec node dist/main
