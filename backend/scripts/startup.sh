#!/bin/bash

# Startup script for production environment
# Handles Prisma migrations with retry logic

set -e

echo "Starting Serenvi Backend..."

# Try to run migrations with timeout and retry logic
MAX_RETRIES=5
RETRY_DELAY=5
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  echo "Attempting database migration (attempt $((RETRY_COUNT + 1))/$MAX_RETRIES)..."
  
  if npx prisma migrate deploy; then
    echo "✅ Database migrations completed successfully"
    break
  else
    RETRY_COUNT=$((RETRY_COUNT + 1))
    
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
      echo "⚠️ Migration failed, retrying in ${RETRY_DELAY}s..."
      sleep $RETRY_DELAY
    else
      echo "❌ Migration failed after $MAX_RETRIES attempts"
      echo "Starting application anyway - migrations may be pending"
    fi
  fi
done

echo "Starting NestJS application..."
node dist/main
