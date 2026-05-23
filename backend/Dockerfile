FROM node:18-alpine

WORKDIR /app

# Install OpenSSL, Python, Make, and G++ for bcrypt compilation
RUN apk add --no-cache openssl python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies with --ignore-scripts to skip broken postinstall scripts
RUN npm ci --ignore-scripts

# Explicitly rebuild bcrypt since we skipped scripts
RUN npm rebuild bcrypt

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Expose port
EXPOSE 3001

# Start the application using production startup
CMD ["npm", "run", "start:prod"]
