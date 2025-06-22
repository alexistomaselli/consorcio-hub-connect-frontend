# Consorcio Hub Connect

Plataforma de gestión de consorcios que permite la administración de edificios, unidades, propietarios y reclamos.

## Estructura del proyecto

Este proyecto está estructurado como una aplicación monorepo con frontend y backend en repositorios separados:

- **Frontend**: React + Vite con TypeScript, usando Tailwind CSS y Shadcn UI
- **Backend**: NestJS con TypeScript, usando Prisma ORM y PostgreSQL

## Repositorios

- Frontend: https://github.com/alexistomaselli/consorcio-hub-connect
- Backend: https://github.com/alexistomaselli/consorcio-hub-connect-backend

## Modelo de ramas (GitFlow)

Utilizamos un modelo basado en GitFlow para gestionar nuestro flujo de trabajo:

- **`main`**: Código en producción
- **`develop`**: Rama principal de integración y desarrollo
- **`feature/*`**: Ramas para nuevas funcionalidades
- **`fix/*`**: Para correcciones de bugs
- **`hotfix/*`**: Para correcciones urgentes en producción

Para más detalles, consulta el archivo [CONTRIBUTING.md](./CONTRIBUTING.md).

## Requisitos de desarrollo

- Node.js v18.x o superior
- npm v9.x o superior
- PostgreSQL 14+

## Configuración y ejecución local

### Frontend

```bash
# Clonar el repositorio
git clone https://github.com/alexistomaselli/consorcio-hub-connect.git
cd consorcio-hub-connect

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

### Backend

```bash
# Clonar el repositorio
git clone https://github.com/alexistomaselli/consorcio-hub-connect-backend.git
cd consorcio-hub-connect-backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Generar Prisma client
npx prisma generate

# Ejecutar migraciones de base de datos
npx prisma migrate dev

# Ejecutar en modo desarrollo
npm run start:dev
```

## Despliegue

El proyecto está configurado para desplegarse utilizando GitHub Actions en un VPS. 

### Configuración de despliegue

Hay dos métodos de despliegue disponibles:

1. **Despliegue automatizado con GitHub Actions**:
   - Configura los secrets necesarios en GitHub
   - Cada push a `main` desplegará automáticamente

2. **Despliegue manual usando Docker**:
   - Usa el `docker-compose.yml` incluido en el proyecto
   - Configura las variables de entorno en un archivo `.env`

Consulta la carpeta [server-config](./server-config/) para configuraciones detalladas.

## Integración con WhatsApp y N8N

El proyecto incluye integración con n8n para automatizar la creación de reclamos desde WhatsApp:

- n8n se ejecuta como un servicio separado
- Los webhooks reciben mensajes de WhatsApp
## Licencia

Este proyecto es privado y está destinado únicamente para uso interno de Consorcio Hub Connect.
### Ventajas de esta Arquitectura
- Aislamiento completo de datos entre edificios
- Facilidad para backup/restore por edificio
- Mejor organización y mantenimiento
- Escalabilidad horizontal

## Modelo de Datos

### Base de Datos

#### Schema `public`
```sql
-- Usuarios y autenticación
table users {
  id            UUID PK
  email         String UNIQUE
  password      String
  firstName     String
  lastName      String
  role          UserRole
  createdAt     DateTime
  updatedAt     DateTime
}

-- Registro de edificios
table buildings {
  id               UUID PK
  name             String
  address          String
  schema           String UNIQUE
  status           BuildingStatus
  createdAt        DateTime
  updatedAt        DateTime
}

-- Proveedores de servicios
table service_providers {
  id          UUID PK
  userId      UUID FK >- users.id
  company     String
  services    String[]
  rating      Float
  createdAt   DateTime
  updatedAt   DateTime
}
```

#### Schema Específico de Edificio
```sql
-- Unidades/departamentos
table units {
  id        UUID PK
  number    String
  floor     String
  ownerId   UUID FK >- public.users.id
  createdAt DateTime
  updatedAt DateTime
}

-- Reclamos/tickets
table claims {
  id               UUID PK
  title            String
  description      String
  status           String
  unitId           UUID FK >- units.id
  creatorId        UUID FK >- public.users.id
  serviceProviderId UUID? FK >- public.service_providers.id
  comments         String[]
  images           String[]
  createdAt        DateTime
  updatedAt        DateTime
}
```

### Roles de Usuario
- **SUPER_ADMIN**: Administrador total del sistema
- **BUILDING_ADMIN**: Administrador de edificio/consorcio
- **OWNER**: Propietario o apoderado de departamento
- **SERVICE_PROVIDER**: Proveedor de servicios

### Módulos Principales

#### 1. Usuarios y Autenticación
```typescript
enum UserRole {
  SUPER_ADMIN = 'super_admin',
  BUILDING_ADMIN = 'building_admin',
  OWNER = 'owner',
  SERVICE_PROVIDER = 'provider'
}

interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  buildings?: Building[];
  units?: Unit[];
  serviceProvider?: ServiceProvider;
}
```

#### 2. Edificios/Consorcios
```typescript
interface Building {
  id: string;
  name: string;
  address: string;
  admins: User[];
  units: Unit[];
  serviceProviders: ServiceProvider[];
  schema: string;
}
```

#### 3. Unidades/Departamentos
```typescript
interface Unit {
  id: string;
  number: string;
  floor: string;
  building: Building;
  owners: User[];
  claims: Claim[];
}
```

#### 4. Tickets/Reclamos
```typescript
interface Claim {
  id: string;
  title: string;
  description: string;
  status: ClaimStatus;
  unit: Unit;
  creator: User;
  assignedProvider?: ServiceProvider;
  comments: ClaimComment[];
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### 5. Proveedores de Servicios
```typescript
interface ServiceProvider {
  id: string;
  user: User;
  company: string;
  services: Service[];
  buildings: Building[];
  claims: Claim[];
  rating: number;
}
```

## Estructura de Carpetas

```
src/
├── modules/
│   ├── auth/           # Autenticación y autorización
│   ├── users/          # Gestión de usuarios
│   ├── buildings/      # Gestión de edificios
│   ├── units/          # Gestión de unidades
│   ├── claims/         # Gestión de reclamos
│   └── providers/      # Gestión de proveedores
├── shared/
│   ├── guards/         # Guards de autenticación y permisos
│   ├── decorators/     # Decoradores personalizados
│   └── interfaces/     # Interfaces compartidas
└── config/            # Configuraciones
```

## Configuración del Entorno

### Requisitos
- Docker y Docker Compose
- Node.js 18+
- Bun (opcional, pero recomendado)

### Variables de Entorno
```env
VITE_API_URL=http://localhost:3000
DATABASE_URL=postgresql://admin:admin123@postgres:5432/consorcio_hub
```

### Puertos
- Frontend: 8080
- Backend API: 3000 (pendiente)
- PostgreSQL: 5432
- pgAdmin: 5050

### Inicio Rápido
1. Clonar el repositorio
2. Ejecutar `docker compose up --build`
3. Acceder a:
   - Frontend: http://localhost:8080
   - pgAdmin: http://localhost:5050
   - API (próximamente): http://localhost:3000

## Estado Actual del Desarrollo

### Completado
- ✅ Configuración inicial del frontend
- ✅ Dockerización del entorno
- ✅ Diseño de la estructura de datos
- ✅ Definición de roles y permisos

### En Progreso
- 🔄 Implementación del backend con NestJS
- 🔄 Sistema de autenticación
- 🔄 Gestión de permisos con CASL

### Próximos Pasos
- ⏳ Implementación de módulos backend
- ⏳ Integración frontend-backend
- ⏳ Sistema de multitenancy por schemas
- ⏳ Gestión de archivos para imágenes-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b581c6c0-951d-4569-95f8-51328c7c58a7) and click on Share -> Publish.
## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
