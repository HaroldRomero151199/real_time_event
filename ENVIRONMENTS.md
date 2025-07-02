# Environment Configuration Guide

This document explains the configuration differences between development, staging, and production environments.

## 🌍 Environment Overview

| Environment | Purpose | Database | Swagger | Logging | Hot Reload |
|-------------|---------|----------|---------|---------|------------|
| **Development** | Local development | Local PostgreSQL | ✅ Enabled | Debug | ✅ Enabled |
| **Staging** | Pre-production testing | Staging PostgreSQL | ✅ Enabled | Info | ❌ Disabled |
| **Production** | Live application | Production PostgreSQL | ❌ Disabled | Warn | ❌ Disabled |

## 📁 Configuration Files

### Development (`env.development`)
```bash
NODE_ENV=development
DATABASE_URL="postgresql://events_user:events_password@localhost:5433/events_db"
PORT=3000
SWAGGER_ENABLED=true
LOG_LEVEL=debug
```

### Staging (`env.staging`)
```bash
NODE_ENV=staging
DATABASE_URL="postgresql://events_user:events_password@staging-db:5432/events_db"
PORT=3000
SWAGGER_ENABLED=true
LOG_LEVEL=info
```

### Production (`env.production`)
```bash
NODE_ENV=production
DATABASE_URL="postgresql://events_user:events_password@production-db:5432/events_db"
PORT=3000
SWAGGER_ENABLED=false
LOG_LEVEL=warn
```

## 🐳 Docker Configurations

### Development (`docker-compose.dev.yml`)
- **Hot reload** enabled with volume mounting
- **Debug logging** enabled
- **Swagger** documentation available
- **Ports**: App 3000, DB 5433

### Staging (`docker-compose.staging.yml`)
- **Production build** without hot reload
- **Info logging** level
- **Swagger** documentation available
- **Ports**: App 3001, DB 5434

### Production (`docker-compose.prod.yml`)
- **Production build** optimized
- **Warning logging** level only
- **Swagger** disabled for security
- **Ports**: App 3002, DB 5435

## 🚀 Quick Commands

### Setup Environment
```bash
# Windows
.\scripts\setup-env.ps1 dev
.\scripts\setup-env.ps1 staging
.\scripts\setup-env.ps1 prod

# Linux/Mac
./scripts/setup-env.sh dev
./scripts/setup-env.sh staging
./scripts/setup-env.sh prod
```

### Start Application
```bash
# Development
npm run start:dev
npm run docker:up:dev

# Staging
npm run start:staging
npm run docker:up:staging

# Production
npm run start:prod
npm run docker:up:prod
```

### Database Operations
```bash
# Development
npm run db:migrate

# Staging/Production
npm run db:migrate:staging
npm run db:migrate:prod
```

## 🔧 Environment-Specific Features

### Development
- **Hot reload** for instant code changes
- **Debug logging** for detailed troubleshooting
- **Swagger UI** for API testing
- **Volume mounting** for live code editing

### Staging
- **Production-like** environment
- **Swagger UI** for testing
- **Info logging** for monitoring
- **Separate database** for testing

### Production
- **Optimized build** for performance
- **Swagger disabled** for security
- **Warning logging** only
- **Restart policy** for reliability

## 🔒 Security Considerations

### Development
- Debug information exposed
- Swagger enabled
- Detailed logging

### Staging
- Limited debug information
- Swagger enabled for testing
- Moderate logging

### Production
- No debug information
- Swagger disabled
- Minimal logging
- Secure JWT secrets

## 📊 Monitoring & Logging

### Log Levels
- **Development**: `debug` - All information
- **Staging**: `info` - Important information
- **Production**: `warn` - Warnings and errors only

### Database Connections
- **Development**: Local PostgreSQL
- **Staging**: Staging PostgreSQL
- **Production**: Production PostgreSQL

## 🚨 Important Notes

1. **Never use development secrets in production**
2. **Always use different databases for each environment**
3. **Swagger should be disabled in production**
4. **Use appropriate logging levels for each environment**
5. **Test migrations in staging before production** 