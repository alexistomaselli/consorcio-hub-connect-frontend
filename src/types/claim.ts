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
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ClaimHistory {
  id: string;
  claimId: string;
  changedBy: string;
  changeType: string; // 'status_change', 'assignment', 'creation', 'comment'
  previousStatus?: string;
  newStatus?: string;
  details?: any;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
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
  category?: string;
  status: ClaimStatus;
  buildingId?: string;
  building?: {
    id: string;
    name: string;
  };
  location: ClaimLocation;
  locationDetail?: string;
  unitId?: string;
  spaceId?: string;
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
  serviceProvider?: {
    id: string;
    name: string;
  };
  priority: ClaimPriority;
  comments?: ClaimComment[];
  history?: ClaimHistory[];
  images: string[];
  unitNumber?: string;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}
