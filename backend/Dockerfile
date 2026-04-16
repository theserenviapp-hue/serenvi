FROM node:18-alpine

WORKDIR /app

# Install OpenSSL for Prisma compatibility
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install dependencies (--ignore-scripts: @clerk/shared postinstall fails in CI)
RUN npm ci --ignore-scripts

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
