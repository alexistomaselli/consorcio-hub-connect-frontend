export type WhatsappStatus = 'DISCONNECTED' | 'PENDING' | 'CONNECTED' | 'FAILED' | 'CONNECTING';
export type N8nFlowStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface WhatsAppInstanceResponse {
  data: WhatsAppInstance | null;
  message: string;
  success: boolean;
}

export interface WhatsAppInstance {
  id: string;
  buildingId: string;
  instanceId?: string;  // Nullable hasta que n8n confirme la creación
  instanceName: string;  // "<buildingName> - <buildingId>"
  status: WhatsappStatus;
  n8nFlowStatus: N8nFlowStatus;
  evolutionApiStatus?: string;  // Estado raw de Evolution API
  qrCode?: string;  // Para el proceso de conexión
  phoneNumber?: string;  // Solo disponible cuando está conectado
  lastError?: string;  // Error de la última operación
  lastConnectionAttempt?: string;  // Último intento de conexión
  connectionAttempts: number;  // Número de intentos de conexión
  qrExpiresAt?: string;  // Fecha de expiración del QR
  createdAt: string;
  updatedAt: string;
}
