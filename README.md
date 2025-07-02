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

# Real-Time Event Manager

A scalable, modular NestJS backend system for managing events in a convention center with real-time capabilities.

## 🎯 Problem Statement

A company organizes events in different rooms of a convention center. Each room can host only one event at a time, but events may overlap in time if they are in different rooms. The system must support:

- **Event Registration**: Register new events ensuring no overlaps in the same room
- **Event Querying**: Query active events within a given time range
- **Event Cancellation**: Cancel events by name
- **Occupancy Reporting**: Generate comprehensive room occupancy reports

## 🏗️ Architecture & Design Decisions

### 1. **Technology Stack**
- **Framework**: NestJS (Node.js) - Chosen for its modular architecture, dependency injection, and enterprise-grade features
- **Database**: Prisma ORM with SQLite/PostgreSQL - Provides type safety and efficient querying
- **Validation**: Class-validator for DTO validation
- **Documentation**: Swagger/OpenAPI for API documentation
- **Testing**: Jest for unit and e2e testing

### 2. **Architecture Pattern**
- **Modular Design**: Vertical slice architecture with clear separation of concerns
- **Domain-Driven Design (DDD)**: Entities, value objects, repositories, and domain services
- **Clean Architecture**: Controllers → Services → Repositories → Database
- **Dependency Injection**: NestJS built-in DI container for loose coupling
- **Module Separation**: 
  - **Events Module**: Core event management functionality
  - **Room Module**: Room-specific operations and queries
  - **Shared Services**: PrismaService and common utilities

### 3. **Data Structures & Algorithms**

#### Event Overlap Detection
```typescript
isOverlapping(otherEvent: Event): boolean {
  if (this.room !== otherEvent.room) return false;
  
  return (
    (this.startTime < otherEvent.endTime && this.endTime > otherEvent.startTime) ||
    (otherEvent.startTime < this.endTime && otherEvent.endTime > this.startTime)
  );
}
```

**Justification**: 
- **Time Complexity**: O(1) for overlap check
- **Space Complexity**: O(1) 
- **Edge Cases**: Handles events that start/end exactly at the same time correctly
- **Efficiency**: Optimized for hundreds of events and dozens of rooms

#### Database Query Optimization
- **Indexed Queries**: Room and time-based queries are indexed for performance
- **Efficient Filtering**: Database-level filtering reduces memory usage
- **Sorted Results**: Events ordered by start time for consistent presentation

### 4. **API Design**

#### RESTful Endpoints

**Events Management** (`/v1/events`)
```
POST   /v1/events                    # Create event
GET    /v1/events/query             # Query active events
POST   /v1/events/:name/cancel      # Cancel event
GET    /v1/events/occupancy-report  # Generate occupancy report
GET    /v1/events/currently-active  # Get currently active events
GET    /v1/events/upcoming          # Get upcoming events
```

**Room Management** (`/v1/rooms`)
```
GET    /v1/rooms                    # Get all rooms
GET    /v1/rooms/:room/events       # Get events by room
GET    /v1/rooms/:room/events/query # Query events in room by time range
GET    /v1/rooms/:room/currently-active # Get currently active event in room
GET    /v1/rooms/:room/availability # Check room availability for time range
```

**Justification**:
- **RESTful**: Familiar, predictable, and easy to integrate
- **Versioned**: `/v1/` prefix allows for future API evolution
- **Extensible**: Easy to add new endpoints for future features
- **Documented**: Swagger integration for developer experience

### 5. **Input/Output Format**

#### JSON API with Validation
```json
{
  "name": "Tech Conference 2024",
  "room": "Room 1", 
  "startTime": "2024-01-15T09:00:00Z",
  "endTime": "2024-01-15T11:00:00Z"
}
```

**Justification**:
- **JSON**: Universal format, easy to parse and debug
- **ISO 8601 Dates**: Standard format for time representation
- **Validation**: Class-validator ensures data integrity
- **Type Safety**: TypeScript interfaces prevent runtime errors

### 6. **Error Handling & Edge Cases**

#### Comprehensive Exception Handling
- **Business Logic Exceptions**: Custom exceptions for domain-specific errors
- **Validation Exceptions**: Input validation with clear error messages
- **HTTP Status Codes**: Proper status codes for different error types

#### Edge Cases Handled
- ✅ Events starting/ending exactly at the same time
- ✅ Invalid time ranges (start ≥ end)
- ✅ Duplicate event names
- ✅ Events in the past
- ✅ Cancelled events
- ✅ Empty or invalid input data

### 7. **Module Architecture & Separation**

#### Events Module (`/src/modules/event/event/`)
- **Core Event Management**: Create, query, cancel events
- **Event Validation**: Business rules and overlap detection
- **Event Repository**: Data access layer for events
- **Event DTOs**: Request/response data transfer objects

#### Room Module (`/src/modules/event/room/`)
- **Room-Specific Operations**: Get events by room, room availability
- **Room Queries**: Time-based queries for specific rooms
- **Room Occupancy**: Calculate room utilization and statistics
- **Room Validation**: Room existence and availability checks

#### Benefits of Module Separation
- **Single Responsibility**: Each module handles its specific domain
- **Maintainability**: Easier to maintain and modify individual features
- **Testability**: Isolated testing for each module
- **Scalability**: Easy to add new room-related features without affecting events
- **Reusability**: Room services can be used by other modules

### 8. **Extensibility Features**

#### Modular Architecture
- **Feature Modules**: Each feature (events, rooms, notifications) in separate modules
- **Repository Pattern**: Easy to switch database implementations
- **Service Layer**: Business logic isolated for easy testing and modification
- **Middleware Support**: Custom validation and authentication middleware

#### Future-Ready Design
- **Real-time Updates**: WebSocket support can be easily added
- **Notifications**: Notification module ready for integration
- **Analytics**: Event tracking and reporting capabilities
- **Multi-tenancy**: Room management system supports multiple venues

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker (optional)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd real_time_event
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment**
```bash
cp env.example .env
# Configure your database settings
```

4. **Run database migrations**
```bash
npx prisma migrate dev
```

5. **Start the application**
```bash
npm run start:dev
```

6. **Access the API documentation**
```
http://localhost:3000/api
```

### Running the Example Scenario

```bash
# Install axios for the example script
npm install axios

# Run the example scenario
node scripts/example-usage.js
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## 📊 Performance Considerations

### Scalability
- **Database Indexing**: Optimized queries for room and time-based lookups
- **Memory Management**: Efficient data structures and garbage collection
- **Connection Pooling**: Database connection management for high concurrency
- **Caching**: Redis integration ready for high-traffic scenarios

### Efficiency
- **Query Optimization**: Database-level filtering and sorting
- **Lazy Loading**: Entities loaded only when needed
- **Batch Operations**: Support for bulk event operations
- **Pagination**: Large result sets handled efficiently

## 🔧 Configuration

### Environment Variables
```env
DATABASE_URL="file:./dev.db"
PORT=3000
NODE_ENV=development
```

### Database Configuration
- **Development**: SQLite for fast development
- **Production**: PostgreSQL for scalability and reliability
- **Testing**: In-memory database for isolated tests

## 📈 Monitoring & Logging

### Built-in Features
- **Request Logging**: HTTP request/response logging
- **Error Tracking**: Comprehensive error handling and logging
- **Performance Metrics**: Response time monitoring
- **Health Checks**: Application health endpoint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🎯 Future Enhancements

- **Real-time Updates**: WebSocket integration for live event updates
- **Mobile API**: REST API optimized for mobile applications
- **Advanced Analytics**: Event attendance and room utilization analytics
- **Multi-language Support**: Internationalization for global events
- **Integration APIs**: Third-party calendar and booking system integrations

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

# Real-Time Event Manager API

## Modules Overview

This project is structured in a modular way using NestJS modules. Each module encapsulates a specific domain or feature, following the Single Responsibility Principle (SRP) from SOLID:

- **Event Module:** Handles all event-related logic, including creation, querying, and cancellation. It uses DTOs for input validation and response shaping, and a service layer for business logic.
- **Room Module:** Manages rooms, exposing endpoints to list available rooms. This separation allows for future extensibility (e.g., room management, capacity updates).
- **Auth, Notification, Home Modules:** These are prepared for extensibility and separation of concerns, even if not all are fully implemented.

## Architecture & Design Decisions

- **Domain-Driven Design (DDD) Principles:** Each module represents a domain, with clear boundaries and responsibilities.
- **Layered Architecture:**
  - **Controller Layer:** Handles HTTP requests and responses, delegates to services.
  - **Service Layer:** Contains business logic, orchestrates repositories and validations.
  - **Repository Layer:** Abstracts data access, using Prisma for database operations.
  - **DTOs:** Used for input validation and output shaping, ensuring type safety and clear API contracts.
- **Prisma ORM:** Chosen for type-safe, efficient, and modern database access with PostgreSQL. Prisma models use `Date` for temporal fields, while DTOs use ISO strings for API compatibility.
- **SOLID Principles:**
  - **Single Responsibility:** Each class/module has one responsibility.
  - **Open/Closed:** Modules are open for extension (e.g., adding new event features) but closed for modification.
  - **Liskov Substitution:** Interfaces and inheritance are used where appropriate (e.g., repository interfaces).
  - **Interface Segregation:** DTOs and interfaces are kept focused and minimal.
  - **Dependency Inversion:** Services depend on abstractions (interfaces), not concrete implementations.
- **Validation:** Uses `class-validator` for DTO validation, ensuring all incoming data is correct before reaching business logic.
- **Swagger/OpenAPI:** All endpoints are documented and types are exposed for easy integration and testing.
- **Testing:**
  - **Unit Tests:** Cover service and controller logic.
  - **E2E Tests:** Validate the full request/response cycle and business rules.

## Data Structure Justification

- **Events:**
  - Use UUIDs for IDs to ensure uniqueness and scalability.
  - Store `startTime` and `endTime` as `Date` in the database for efficient querying and comparison.
  - API accepts and returns ISO 8601 strings for interoperability.
- **Rooms:**
  - Use UUIDs for IDs, allowing for distributed and scalable room management.
  - Store capacity and name for future extensibility.

## Patterns Used

- **Repository Pattern:** Abstracts data access, making the system database-agnostic and testable.
- **DTO Pattern:** Ensures clear contracts between layers and with API consumers.
- **Factory/Mapper Pattern:** Used in services/controllers to map between entities and DTOs.
- **Middleware/Interceptor Pattern:** Used for global response wrapping and error handling.

## Why this architecture?

- **Extensibility:** New features (e.g., notifications, analytics) can be added as new modules without affecting existing code.
- **Maintainability:** Clear separation of concerns and adherence to SOLID make the codebase easy to maintain and extend.
- **Testability:** Each layer can be tested in isolation, and the repository pattern allows for easy mocking.
- **Scalability:** Using UUIDs and modular design allows the system to scale horizontally.

---

For more details, see the code comments and Swagger documentation at `/api` when the app is running.
