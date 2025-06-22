export enum ClaimStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CANCELLED = 'CANCELLED',
}

export enum ClaimLocation {
  UNIT = 'UNIT',
  COMMON_AREA = 'COMMON_AREA',
  BUILDING = 'BUILDING',
}

export enum ClaimPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface ClaimComment {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  contentType: string;
  createdAt: string;
}

export interface Claim {
  id: string;
  title: string;
  description: string;
  status: ClaimStatus;
  buildingId?: string; // Agregado para compatibilidad con la implementación de edición
  location: ClaimLocation;
  locationDetail?: string;
  unitId?: string;
  unit?: {
    id: string;
    number: string;
    floor: string;
  };
  space?: {
    id: string;
    name: string;
    floor?: string;
    spaceType?: {
      id: string;
      name: string;
    };
  };
  creatorId: string;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
  };
  serviceProviderId?: string;
  priority: ClaimPriority;
  comments: ClaimComment[];
  images: string[];
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}
