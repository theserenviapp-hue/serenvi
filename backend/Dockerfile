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

# Copy startup script
COPY start-prod.sh /app/start-prod.sh
RUN chmod +x /app/start-prod.sh

# Expose port
EXPOSE 3001

# Start the application using production startup script
CMD ["/app/start-prod.sh"]
