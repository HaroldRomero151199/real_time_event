# Use official Node.js image
FROM node:18-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the app (for production)
RUN npm run build

# Production image
FROM node:18-alpine AS prod
WORKDIR /app
COPY --from=base /app .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/main.js"]

# Development image (optional, use with build-arg DEV=true)
FROM node:18-alpine AS dev
WORKDIR /app
COPY --from=base /app .
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# Final stage: choose prod or dev
FROM prod AS final
ARG DEV=false
COPY --from=dev /app .
ENV NODE_ENV=${NODE_ENV}
CMD ["node", "dist/main.js"] 