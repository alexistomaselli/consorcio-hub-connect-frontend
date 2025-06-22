export type UserRole = 'admin' | 'user' | 'BUILDING_ADMIN' | 'SUPER_ADMIN' | 'OWNER';

export interface BuildingData {
  address: string;
  floors: string;
  totalUnits: string;
  constructionYear?: string;
  contact?: {
    phone: string;
    whatsapp: string;
    email?: string;
    website?: string;
    description?: string;
  };
  adminPhone: string;
}

export interface Building {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  plan?: {
    id: string;
    name: string;
    type: string;
    features: string[];
  };
  trialEndsAt?: string;
  adminId: string;
  admin?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  isProfileComplete: boolean;
  whatsapp?: import('./whatsapp').WhatsAppInstance;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  buildingId?: string;
  buildingName?: string;
  whatsappNumber?: string;
  alternatePhone?: string;
  createdAt: Date;
  buildingData?: BuildingData;
  emailVerifications?: {
    id: string;
    email: string;
    verificationCode: string;
    expiresAt: Date;
    isVerified: boolean;
  }[];
}

export * from './whatsapp';

// Movido a types/whatsapp.ts
export interface OldWhatsAppInstance {
  instanceId: string;
  instanceName: string;  // Formato: <nombre_edificio> - <id_edificio>
  phoneNumber?: string;  // Solo disponible cuando está conectado
  status: 'CREATED' | 'PENDING' | 'CONNECTED' | 'DISCONNECTED' | 'FAILED';
  lastConnection?: Date;
  qrCode?: string;
  qrExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  error?: string;  // Para almacenar mensajes de error si algo falla
}

export type ClaimStatus = 'pending' | 'in_progress' | 'resolved' | 'cancelled';

export type ClaimCategory = 'plumbing' | 'electrical' | 'elevator' | 'general' | 'other';

export interface ClaimComment {
  id: string;
  content: string;
  userId: string;
  claimId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  url: string;
  type: 'image' | 'document';
  name: string;
}

export interface Claim {
  id: string;
  title: string;
  description: string;
  status: ClaimStatus;
  attachments?: Attachment[];
  category: ClaimCategory;
  unitId?: string;
  userId: string;
  buildingId: string;
  assignedToId?: string;
  createdAt: string;
  updatedAt: string;
  comments?: ClaimComment[];
  creatorId?: string;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role?: UserRole;
  };
  unitNumber?: string;
  space?: {
    id: string;
    name: string;
  };
}

export interface ClaimCreationData {
  title: string;
  description: string;
  category: ClaimCategory;
  unitId?: string;
  userId: string;
  buildingId: string;
}

export type DocumentType = 'DNI' | 'PASSPORT' | 'CUIT' | 'CUIL' | 'OTHER';

export interface GlobalOwner {
  id: string;
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  email: string;
  phone?: string;
  whatsappNumber?: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

export interface BuildingOwnership {
  globalOwnerId: string;
  buildingId: string;
  units: string[];
  notificationPreferences: {
    email: boolean;
    whatsapp: boolean;
    push: boolean;
    types: {
      claims: boolean;
      expenses: boolean;
      documents: boolean;
      meetings: boolean;
    };
  };
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppValidation {
  code: string;
  attempts: number;
  validUntil: Date;
  validated: boolean;
  validatedAt?: Date;
}

export interface Invitation {
  id: string;
  buildingId: string;
  whatsappNumber: string;  // Ahora es requerido
  documentType: DocumentType;
  documentNumber: string;
  firstName: string;
  lastName: string;
  units: string[];
  status: 'PENDING_VALIDATION' | 'VALIDATED' | 'EXPIRED';
  validation?: WhatsAppValidation;
  aiAgent: {  // Ahora es requerido y habilitado por defecto
    enabled: boolean;
    preferences: {
      claims: boolean;
      expenses: boolean;
      documents: boolean;
      meetings: boolean;
    };
  };
  lastInteraction?: {
    type: 'VALIDATION' | 'COMMAND' | 'WEB_ACCESS';
    timestamp: Date;
    details?: string;
  };
  webAccess?: {
    token: string;
    validUntil: Date;
    used: boolean;
  };
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Owner extends GlobalOwner {
  buildings: {
    buildingId: string;
    buildingName: string;
    units: Unit[];
    ownership: BuildingOwnership;
  }[];
}

export interface ServiceProvider {
  id: string;
  name: string;
  businessName?: string;  // razón social
  documentType: DocumentType;
  documentNumber: string;
  services: string[];  // tipos de servicios que provee
  contact: {
    phone: string;
    whatsapp?: string;
    email: string;
    address?: string;
  };
  buildingId: string;  // edificio al que está asociado
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

export interface Unit {
  id: string;
  number: string;
  floor: string;
  buildingId: string;
  ownerId?: string;
  tenantId?: string;
  type: 'APARTMENT' | 'STORE' | 'PARKING' | 'OTHER';
  status: 'OCCUPIED' | 'VACANT' | 'UNDER_MAINTENANCE';
  squareMeters?: number;
  observations?: string;
}

