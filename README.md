<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Real-Time Event Manager API

A comprehensive API for managing events in a convention center built with NestJS, Prisma, and PostgreSQL.

## 🚀 Features

- **Event Management**: Create, query, and cancel events
- **Room Management**: Manage different rooms in the convention center
- **Overlap Prevention**: Ensure no overlapping events in the same room
- **Real-time Queries**: Find active events within time ranges
- **Occupancy Reports**: Generate comprehensive room occupancy reports
- **Docker Support**: Full containerization with PostgreSQL
- **API Documentation**: Swagger/OpenAPI documentation

## 🏗️ Architecture

```
src/modules/event/
├── event/                    # Event management module
│   ├── controllers/         # HTTP controllers
│   ├── services/           # Business logic
│   ├── repositories/       # Data access layer (Prisma)
│   ├── entities/           # Data models
│   ├── dtos/              # Data Transfer Objects
│   ├── exceptions/        # Custom exceptions
│   ├── validators/        # Validation logic
│   ├── middlewares/       # Request processing
│   └── prisma/           # Prisma service
├── room/                   # Room management module
└── event.module.ts        # Main module
```

## 🛠️ Tech Stack

- **Backend**: NestJS (Node.js framework)
- **Database**: PostgreSQL with Prisma ORM
- **Containerization**: Docker & Docker Compose
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator & class-transformer
- **Testing**: Jest

## 📋 Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

## 🌍 Environment Configuration

The application supports multiple environments: **development**, **staging**, and **production**. Each environment has its own configuration file and Docker setup.

### Environment Files
- `env.development` - Development environment configuration
- `env.staging` - Staging environment configuration  
- `env.production` - Production environment configuration

### Quick Environment Setup

#### Using Scripts (Recommended)
```bash
# Windows PowerShell
.\scripts\setup-env.ps1 dev
.\scripts\setup-env.ps1 staging
.\scripts\setup-env.ps1 prod

# Linux/Mac
chmod +x scripts/setup-env.sh
./scripts/setup-env.sh dev
./scripts/setup-env.sh staging
./scripts/setup-env.sh prod
```

#### Using npm scripts
```bash
npm run env:dev      # Setup development environment
npm run env:staging  # Setup staging environment
npm run env:prod     # Setup production environment
```

### Environment-Specific Commands

#### Development
```bash
npm run start:dev        # Start with hot reload
npm run docker:up:dev    # Start with Docker (hot reload)
```

#### Staging
```bash
npm run start:staging    # Start staging server
npm run docker:up:staging # Start with Docker
```

#### Production
```bash
npm run start:prod       # Start production server
npm run docker:up:prod   # Start with Docker
```

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd real_time_event
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment
```bash
# Setup development environment
npm run env:dev
```

### 4. Start the database and run migrations
```bash
# For Windows
npm run setup:dev

# For Linux/Mac
chmod +x scripts/dev-setup.sh
./scripts/dev-setup.sh
```

### 5. Start the development server
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`
Swagger documentation at `http://localhost:3000/api`

## 🐳 Docker Setup

### Environment-Specific Docker Commands

#### Development (with hot reload)
```bash
npm run docker:up:dev    # Start development environment
npm run docker:logs      # View logs
npm run docker:down      # Stop services
```

#### Staging
```bash
npm run docker:up:staging # Start staging environment
npm run docker:logs       # View logs
npm run docker:down       # Stop services
```

#### Production
```bash
npm run docker:up:prod    # Start production environment
npm run docker:logs       # View logs
npm run docker:down       # Stop services
```

### Ports by Environment
- **Development**: App on port 3000, DB on port 5433
- **Staging**: App on port 3001, DB on port 5434
- **Production**: App on port 3002, DB on port 5435

### General Docker Commands
```bash
npm run docker:up         # Start default environment
npm run docker:logs       # View logs
npm run docker:down       # Stop all services
```

## 📊 Database Management

### Generate Prisma client
```bash
npm run db:generate
```

### Run migrations
```bash
npm run db:migrate
```

### Open Prisma Studio (Database GUI)
```bash
npm run db:studio
```

### Reset database
```bash
npm run db:reset
```

## 🧪 Testing

### Run tests
```bash
npm run test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run e2e tests
```bash
npm run test:e2e
```

## 📚 API Endpoints

### Events
- `POST /v1/events` - Create a new event
- `GET /v1/events/query` - Query active events in time range
- `POST /v1/events/:name/cancel` - Cancel an event
- `GET /v1/events/occupancy-report` - Generate occupancy report

### Example Usage

#### Create Event
```bash
curl -X POST http://localhost:3000/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Conference 2024",
    "room": "Room 1",
    "startTime": "2024-01-15T09:00:00Z",
    "endTime": "2024-01-15T11:00:00Z"
  }'
```

#### Query Events
```bash
curl "http://localhost:3000/v1/events/query?startTime=2024-01-15T10:00:00Z&endTime=2024-01-15T10:45:00Z"
```

## 🔧 Development

### Project Structure
- **Modular Architecture**: Each feature has its own module
- **Repository Pattern**: Clean separation of data access
- **DTO Validation**: Input/output validation with decorators
- **Exception Handling**: Custom exceptions for business logic
- **Middleware Support**: Request processing and validation

### Code Quality
```bash
# Format code
npm run format

# Lint code
npm run lint
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://events_user:events_password@localhost:5432/events_db` |
| `NODE_ENV` | Application environment | `development` |
| `PORT` | Application port | `3000` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🧪 Test Coverage

The application includes comprehensive test coverage:

- **Unit Tests**: Test individual use cases and business logic
- **Integration Tests**: Test repository implementations
- **E2E Tests**: Test complete API endpoints
- **Edge Cases**: Test boundary conditions and error scenarios

### Test Structure

```
src/modules/events/application/use-cases/
├── create-event.use-case.spec.ts
├── query-events.use-case.spec.ts
├── cancel-event.use-case.spec.ts
└── generate-occupancy-report.use-case.spec.ts

test/
└── events.e2e-spec.ts
```

## 🚀 Performance & Scalability

### Current Performance

- **Event Creation**: O(log n) with database indexing
- **Overlap Detection**: O(1) for single event, O(n) for batch operations
- **Time Range Queries**: O(log n) with indexed queries
- **Occupancy Reports**: O(n) where n is total number of events

### Scalability Features

- **Database Indexing**: Optimized queries for large datasets
- **Connection Pooling**: Efficient database connection management
- **Modular Architecture**: Easy to add caching, load balancing, etc.
- **API Versioning**: Backward compatibility for future changes

## 🔮 Future Enhancements

The architecture is designed to be extensible for future features:

- **Real-time Updates**: WebSocket integration for live event updates
- **Caching Layer**: Redis integration for improved performance
- **Authentication**: JWT-based authentication and authorization
- **Audit Logging**: Comprehensive event audit trails
- **Multi-tenancy**: Support for multiple convention centers
- **Advanced Scheduling**: Recurring events, conflict resolution
- **Mobile API**: Optimized endpoints for mobile applications

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

---

**Built with ❤️ using NestJS and TypeScript**

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
