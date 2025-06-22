# Sistema de Gestión de Propietarios

## Visión General
El sistema de gestión de propietarios permite manejar eficientemente la relación entre propietarios y edificios, considerando que un propietario puede tener unidades en múltiples edificios mientras mantiene una única identidad en el sistema.

## Arquitectura

### 1. Sistema de Identidad Global

#### Propietario Global
```typescript
interface GlobalOwner {
  id: string;
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  email: string;
  phone?: string;
  whatsappNumber?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Vinculación con Edificios
```typescript
interface BuildingOwnership {
  globalOwnerId: string;
  buildingId: string;
  units: string[];  // IDs de las unidades en este edificio
  notificationPreferences: {
    email: boolean;
    whatsapp: boolean;
    push: boolean;
    types: {
      claims: boolean;
      expenses: boolean;
      documents: boolean;
      meetings: boolean;
    }
  };
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Sistema de Invitaciones

#### Invitación
```typescript
interface Invitation {
  id: string;
  buildingId: string;
  email: string;
  documentType: DocumentType;
  documentNumber: string;
  token: string;
  units: string[];
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
  expiresAt: Date;
  createdAt: Date;
}
```

## Flujos de Trabajo

### 1. Registro de Propietario por Invitación

1. **Creación de Invitación**
   - Admin ingresa datos del propietario y unidades
   - Sistema verifica si ya existe el propietario
   - Genera token único de invitación
   - Envía email con link de invitación

2. **Proceso de Registro**
   - Propietario accede al link de invitación
   - Sistema verifica validez del token
   - Si el propietario ya existe:
     - Login normal
     - Vinculación automática con el edificio
   - Si es nuevo propietario:
     - Formulario de registro
     - Creación de cuenta
     - Vinculación con edificio

### 2. Gestión de Accesos

1. **Vinculación con Edificio**
   ```typescript
   interface BuildingAccess {
     ownerId: string;
     buildingId: string;
     accessLevel: 'FULL' | 'READONLY';
     features: {
       claims: boolean;
       expenses: boolean;
       documents: boolean;
       meetings: boolean;
     };
   }
   ```

2. **Transferencia de Propiedad**
   - Revocación de acceso a unidad específica
   - Mantenimiento de acceso a otras unidades
   - Proceso de invitación para nuevo propietario

### 3. Dashboard de Propietario

1. **Vista Multi-edificio**
   - Lista de edificios donde tiene unidades
   - Resumen de estado por edificio:
     - Reclamos activos
     - Expensas pendientes
     - Documentos nuevos
     - Próximas reuniones

2. **Preferencias por Edificio**
   - Configuración de notificaciones
   - Método de contacto preferido
   - Visualización de información

## Consideraciones de Seguridad

1. **Privacidad**
   - Los propietarios solo ven edificios donde tienen unidades
   - Información sensible segregada por edificio
   - Tokens de invitación con expiración

2. **Autenticación**
   - Verificación de email
   - Validación de documento
   - Rate limiting en invitaciones

3. **Auditoría**
   - Log de cambios de propiedad
   - Registro de accesos
   - Historial de notificaciones

## API Endpoints

### Invitaciones
```typescript
POST /api/buildings/:buildingId/invitations
GET /api/invitations/:token
POST /api/invitations/:token/accept
```

### Propietarios
```typescript
GET /api/owners/me
GET /api/buildings/:buildingId/owners
POST /api/buildings/:buildingId/owners
PATCH /api/buildings/:buildingId/owners/:ownerId
```

### Unidades
```typescript
GET /api/buildings/:buildingId/units
PATCH /api/buildings/:buildingId/units/:unitId/owner
```
