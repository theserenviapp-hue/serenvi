FROM node:18-alpine

WORKDIR /app

# Install build tools for native modules (bcrypt) + OpenSSL for Prisma
RUN apk add --no-cache openssl python3 make g++ libc6-compat

# Copy package files
COPY package*.json ./

# Install dependencies (--ignore-scripts: @clerk/shared postinstall fails)
RUN npm ci --ignore-scripts
# Rebuild bcrypt native binary (was skipped by --ignore-scripts)
RUN npm rebuild bcrypt

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Remove dev dependencies
RUN npm prune --production --ignore-scripts

# Expose port
EXPOSE 3001

# Start the application using production startup
CMD ["npm", "run", "start:prod"]
