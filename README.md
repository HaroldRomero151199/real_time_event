# Real-Time Event Manager

## 📋 Descripción / Description

Sistema de gestión de eventos en tiempo real para centros de convenciones desarrollado con **NestJS**, **PostgreSQL**, **Docker** y **Prisma ORM**.

*Real-time event management system for convention centers built with **NestJS**, **PostgreSQL**, **Docker** and **Prisma ORM**.*

## 🛠️ Stack Tecnológico / Technology Stack

| Tecnología | Propósito | Justificación |
|------------|-----------|---------------|
| **NestJS** | Framework Backend | Arquitectura modular, DI nativo, decoradores, escalabilidad enterprise |
| **TypeScript** | Lenguaje | Type safety, mejor DX, detección temprana de errores |
| **PostgreSQL** | Base de Datos | ACID compliance, relaciones complejas, rendimiento en producción |
| **Prisma ORM** | ORM | Type-safe queries, migraciones automáticas, schema-first approach |
| **Docker** | Containerización | Consistencia entre entornos, fácil deployment |
| **Jest** | Testing | Testing framework robusto con mocks y coverage |
| **Swagger** | Documentación API | Auto-generación de docs, testing interactivo |

## 🏗️ Arquitectura y Decisiones de Diseño

### 1. **Arquitectura Modular con Vertical Slice**

```
src/modules/
├── event/              # Gestión completa de eventos
│   ├── event/          # Core event management
│   └── room/           # Room-specific operations
├── user/               # Gestión completa de usuarios
│   ├── profile/        # User profiles & preferences
│   ├── location/       # Geographic & zone management
│   └── settings/       # User configurations
├── auth/               # Autenticación y autorización
├── notification/       # Sistema de notificaciones
└── common/             # Utilidades compartidas
```

**¿Por qué Vertical Slice? (Arquitectura No Tradicional)**

**Vertical Slice Architecture** rompe con la arquitectura tradicional por capas horizontales. Mientras las arquitecturas convencionales separan por tipo técnico (controllers, services, models), Vertical Slice separa por **dominio de negocio**.

**Regla de Organización Aplicada:**
- **Máximo 4 archivos por carpeta** - Si excede, se subdivide
- **Auto-contenido**: Cada slice tiene todo lo necesario
- **Independencia**: Modificaciones aisladas por dominio

**¿Por qué NO Laravel/Express?**
- **Laravel**: Estructura rígida MVC, difícil modularización granular
- **Express**: Sin estructura nativa, versionado manual complejo
- **NestJS**: Modularidad nativa + DI + decoradores = Vertical Slice natural

**Combinación: Vertical Slice + Arquitectura Modular = "Divide y Vencerás"**

La **Arquitectura Modular** combinada con **Vertical Slice** crea una estrategia perfecta de **"Divide y Vencerás"** para sistemas grandes y robustos:

```
Sistema Grande → Módulos Grandes → Vertical Slices → Micro-Componentes
   (Robusto)   →   (Dominios)   →    (Features)   →   (≤4 archivos)
```

**Estrategia de División:**
1. **Nivel 1**: Dividir sistema en **módulos grandes** por dominio de negocio
2. **Nivel 2**: Cada módulo usa **vertical slices** por característica específica
3. **Nivel 3**: Cada slice mantiene **máximo 4 archivos** por carpeta

**Beneficios del "Divide y Vencerás":**
- ✅ **Cohesión alta**: Toda la funcionalidad de un dominio en un lugar
- ✅ **Bajo acoplamiento**: Módulos independientes, cambios aislados
- ✅ **Escalabilidad**: Equipos especializados por módulo
- ✅ **Testing**: Aislamiento completo para pruebas
- ✅ **Deployment**: Evolución a microservicios independientes
- ✅ **Mantenibilidad**: Máximo 4 archivos por carpeta, fácil navegación
- ✅ **Versionado**: Módulos independientes, versionado por feature
- ✅ **Sistemas Robustos**: Problemas grandes divididos en problemas pequeños y manejables

### 2. **Patrón de Diseño: Clean Architecture + Repository Pattern**

```
Controller → Service → Repository → Database
     ↓         ↓          ↓
    DTOs   Business   Data Access
           Logic      Abstraction
```

**Repository Pattern Implementado:**
- **Interface**: `IEventRepository` - Contrato de acceso a datos
- **Implementation**: `EventsRepository` - Implementación específica con Prisma
- **Dependency Injection**: Inyección del repositorio en servicios
- **Abstraction**: Lógica de negocio independiente de la base de datos

**Response Wrapper Pattern:**
```typescript
ResponseWrapper<T> {
  meta: {
    success: boolean;
    code: number;
    message: string;
    errors?: string[];
  };
  data: T;
}
```

**Justificación:**
- **Separation of Concerns**: Cada capa tiene una responsabilidad específica
- **Dependency Inversion**: Dependemos de abstracciones, no implementaciones
- **Testabilidad**: Fácil mocking del repository para unit tests
- **Flexibilidad**: Cambiar DB sin afectar lógica de negocio
- **Consistencia**: Respuestas uniformes con header y body estructurados

### 3. **Versionamiento de API: `/v1/`**

**¿Por qué versionar desde v1?**
- ✅ **Evolución**: Permite cambios breaking sin afectar clientes existentes
- ✅ **Mantenimiento**: Soporte a múltiples versiones simultáneamente
- ✅ **Profesionalismo**: Estándar de la industria para APIs públicas
- ✅ **Backward Compatibility**: Clientes pueden migrar gradualmente

### 4. **Estructura por Capas Dentro de Cada Módulo**

```
modules/event/event/
├── controllers/        # HTTP handlers
├── services/          # Business logic
├── repositories/      # Data access
├── dtos/             # Data transfer objects
├── entities/         # Domain models
├── exceptions/       # Custom exceptions
└── validators/       # Business validations
```

**Beneficios:**
- **Predictibilidad**: Estructura consistente en todos los módulos
- **Mantenibilidad**: Fácil localizar y modificar código
- **Onboarding**: Nuevos desarrolladores entienden rápidamente
- **Escalabilidad**: Agregar nuevas features siguiendo el mismo patrón

## 🚀 Inicio Rápido / Quick Start

### Docker (Recomendado)
```bash
# Clonar y ejecutar
git clone <repo-url>
cd real_time_event
npm run docker:rebuild

# Verificar funcionamiento
curl http://localhost:3000/v1/events/currently-active
```

### Desarrollo Local
```bash
npm install
npm run db:migrate
npm run db:seed
npm run start:dev
```

## 📡 API Principal / Main API

| Endpoint | Método | Descripción |
|----------|---------|-------------|
| `/v1/events` | POST | Crear evento |
| `/v1/events/query` | GET | Consultar eventos por tiempo |
| `/v1/events/:name/cancel` | POST | Cancelar evento |
| `/v1/events/occupancy-report` | GET | Reporte de ocupación |

**Documentación completa:** http://localhost:3000/api

## 🧪 Testing

```bash
npm test              # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:cov      # Coverage report
```

## 📁 Documentación Modular

El proyecto se divide en módulos grandes, cada uno como un sub-proyecto independiente con su propio `README.md`:

- `src/modules/event/README.md` - **Módulo de Eventos** (completo: gestión de eventos, salas, reservas)
- `src/modules/user/README.md` - **Módulo de Usuario** (perfil, ubicación, zona, preferencias)
- `src/modules/auth/README.md` - **Módulo de Autenticación** (login, JWT, roles, permisos)
- `src/modules/notification/README.md` - **Módulo de Notificaciones** (emails, push, webhooks)
- `src/common/README.md` - **Módulo Compartido** (utils, filters, interceptors, DTOs base)

## 🎯 Características Principales

- ✅ **Sin superposición de eventos** en la misma sala
- ✅ **Consultas por rango de tiempo** eficientes
- ✅ **Cancelación de eventos** por nombre
- ✅ **Reportes de ocupación** en tiempo real
- ✅ **Validaciones robustas** de edge cases
- ✅ **API versionada** para evolución futura
- ✅ **Documentación Swagger** interactiva
- ✅ **Tests comprensivos** unitarios y e2e

---

**Arquitectura diseñada para escalabilidad, mantenibilidad y extensibilidad** 🚀
