import { getAuthHeaders } from '@/lib/api';
import { Owner } from '@/types';

interface InviteOwnerData {
  firstName: string;
  lastName: string;
  whatsappNumber: string;
  unitNumber: string;
}

interface InviteOwnerResponse {
  id: string;
  token: string;
  verifyCode: string;
  expiresAt: string;
  message: string;
}

export class OwnerService {
  static async getOwners(buildingId: string): Promise<Owner[]> {
    const response = await fetch(`/api/owners/buildings/${buildingId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener propietarios');
    }

    return response.json();
  }

  static async inviteOwner(buildingId: string, data: InviteOwnerData): Promise<InviteOwnerResponse> {
    console.log('Inviting owner with data:', { buildingId, data });
    const response = await fetch(`/api/owners/buildings/${buildingId}/invite`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });

    console.log('Response:', response);
    if (!response.ok) {
      const error = await response.json();
      console.error('Error response:', error);
      throw new Error(error.message || 'Error al enviar invitación');
    }

    return response.json();
  }
}
