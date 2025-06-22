# TODO List - Consorcio Hub Connect

## Próximos Pasos

### 0. Mejoras en Vista de Reclamos para BUILDING_ADMIN
- [ ] Agregar información del creador del reclamo en la vista de BUILDING_ADMIN
  - [ ] Opción 1: Añadir una nueva columna "Creador" en la tabla de reclamos
  - [ ] Opción 2: Mostrar un badge con el nombre del creador junto a cada reclamo
  - [ ] Obtener datos del creador desde el backend (nombre, apellido, etc.)

### 0.1. Integración con WhatsApp mediante Agente IA
- [ ] Implementar estrategia de deploy para trabajar con MCP
  - [ ] Configurar entorno de producción
  - [ ] Preparar API para ser consumida desde servicios externos
- [ ] Desarrollar agente IA para WhatsApp
  - [ ] Integrar MCP para consumir endpoints de la API
  - [ ] Crear flujos de conversación para gestión de reclamos
  - [ ] Implementar autenticación de usuarios OWNER vía WhatsApp
- [ ] Funcionalidades del agente IA
  - [ ] Crear nuevos reclamos
  - [ ] Consultar estado de reclamos existentes
  - [ ] Recibir notificaciones sobre actualizaciones
  - [ ] Gestionar otros módulos del sistema desde WhatsApp

### 1. Implementar Creación de Edificios y Schemas
- [ ] Crear módulo `BuildingModule` en el backend
  - [ ] BuildingController
  - [ ] BuildingService
  - [ ] DTOs (CreateBuildingDto, etc.)
- [ ] Implementar lógica de creación de edificios
  - [ ] Crear registro en tabla `buildings`
  - [ ] Generar nombre único para el schema
  - [ ] Crear nuevo schema en la base de datos
  - [ ] Ejecutar migraciones para crear tablas:
    - `units`
    - `claims`



### 3. Estructura de la Base de Datos
#### Schema Público (`public`)
- Tabla `users`: Todos los usuarios (admins, dueños, proveedores)
- Tabla `buildings`: Información de edificios
- Tabla `plans`: Planes disponibles
- Tabla `service_providers`: Proveedores de servicios

#### Schema por Edificio (`building_${uuid}`)
- Tabla `units`:
  ```prisma
  model Unit {
    id        String   @id @default(uuid())
    number    String
    floor     String
    ownerId   String   // ID del usuario en public.users
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
    claims    Claim[]
  }
  ```
- Tabla `claims`:
  ```prisma
  model Claim {
    id               String    @id @default(uuid())
    title            String
    description      String
    status          String    
    unit            Unit      @relation(fields: [unitId], references: [id])
    unitId          String
    creatorId       String    // ID del usuario en public.users
    serviceProviderId String?  // ID del proveedor en public.service_providers
    comments        String[]
    images          String[]
    createdAt       DateTime  @default(now())
    updatedAt       DateTime  @updatedAt
  }
  ```

### Notas
- La estructura actual permite que un usuario tenga unidades en múltiples edificios
- Cada edificio tiene su propio schema para mejor organización y seguridad
- Las referencias a usuarios y proveedores siempre apuntan a las tablas del schema público
