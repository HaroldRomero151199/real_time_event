# Use official Node.js image
FROM node:18-alpine

# Install PostgreSQL client for database connectivity checks
RUN apk add --no-cache postgresql-client

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create a robust startup script
RUN echo '#!/bin/sh' > start.sh && \
    echo 'set -e' >> start.sh && \
    echo '' >> start.sh && \
    echo 'echo "🔍 Waiting for PostgreSQL to be ready..."' >> start.sh && \
    echo '' >> start.sh && \
    echo '# Wait for PostgreSQL to be ready' >> start.sh && \
    echo 'until pg_isready -h postgres -p 5432 -U events_user; do' >> start.sh && \
    echo '  echo "⏳ PostgreSQL is not ready yet. Retrying in 2 seconds..."' >> start.sh && \
    echo '  sleep 2' >> start.sh && \
    echo 'done' >> start.sh && \
    echo '' >> start.sh && \
    echo 'echo "✅ PostgreSQL is ready!"' >> start.sh && \
    echo 'echo "🔄 Running Prisma migrations..."' >> start.sh && \
    echo '' >> start.sh && \
    echo '# Run migrations with retry logic' >> start.sh && \
    echo 'max_retries=5' >> start.sh && \
    echo 'retry_count=0' >> start.sh && \
    echo '' >> start.sh && \
    echo 'while [ $retry_count -lt $max_retries ]; do' >> start.sh && \
    echo '  if npx prisma migrate deploy; then' >> start.sh && \
    echo '    echo "✅ Migrations completed successfully!"' >> start.sh && \
    echo '    break' >> start.sh && \
    echo '  else' >> start.sh && \
    echo '    retry_count=$((retry_count + 1))' >> start.sh && \
    echo '    echo "❌ Migration attempt $retry_count failed. Retrying in 3 seconds..."' >> start.sh && \
    echo '    sleep 3' >> start.sh && \
    echo '  fi' >> start.sh && \
    echo 'done' >> start.sh && \
    echo '' >> start.sh && \
    echo 'if [ $retry_count -eq $max_retries ]; then' >> start.sh && \
    echo '  echo "💥 Failed to run migrations after $max_retries attempts"' >> start.sh && \
    echo '  exit 1' >> start.sh && \
    echo 'fi' >> start.sh && \
    echo '' >> start.sh && \
    echo 'echo "🌱 Seeding database..."' >> start.sh && \
    echo 'if npx prisma db seed; then' >> start.sh && \
    echo '  echo "✅ Database seeded successfully!"' >> start.sh && \
    echo 'else' >> start.sh && \
    echo '  echo "⚠️  Database seeding failed, but continuing (might already be seeded)"' >> start.sh && \
    echo 'fi' >> start.sh && \
    echo '' >> start.sh && \
    echo 'echo "🚀 Starting NestJS application..."' >> start.sh && \
    echo 'npm run start:dev' >> start.sh && \
    chmod +x start.sh

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api || exit 1

# Use the startup script
CMD ["sh", "./start.sh"] 