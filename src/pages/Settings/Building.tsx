import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { WhatsAppConfig } from '@/components/Settings/WhatsAppConfig';
import { Building } from '@/types';
import { WhatsAppInstance } from '@/types/whatsapp';
import { useQuery } from '@tanstack/react-query';



// No necesitamos API_BASE_URL porque usamos el proxy configurado en vite.config.ts

export default function BuildingSettings() {
  console.log('Rendering BuildingSettings component');
  const { currentUser, getAuthHeaders } = useAuth();
  const token = localStorage.getItem('token');

  console.log('Current user:', {
    id: currentUser?.id,
    role: currentUser?.role,
    buildingId: currentUser?.buildingId,
    buildingName: currentUser?.buildingName
  });
  
  // Si no hay usuario, token o buildingId, mostrar error
  if (!currentUser || !token) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <p className="text-red-600 font-medium">Error de autenticación</p>
          <p className="text-sm text-gray-500">
            {!currentUser ? 'No hay usuario autenticado' : 'La sesión ha expirado'}
          </p>
        </div>
      </div>
    );
  }

  const buildingId = currentUser.buildingId;
  console.log('Building ID:', buildingId);
  console.log('Current user full info:', currentUser);

  if (!buildingId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <p className="text-red-600 font-medium">Error de configuración</p>
          <p className="text-sm text-gray-500">No hay edificio asociado al usuario</p>
        </div>
      </div>
    );
  }

  const { data: building, isLoading: buildingLoading } = useQuery<Building>({
    queryKey: ['building', buildingId],
    queryFn: async () => {
      const response = await fetch(`/buildings/${buildingId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error al cargar el edificio');
      return response.json();
    },
    enabled: !!buildingId,
  });

  const { data: whatsappInstance, isLoading: whatsappLoading, error } = useQuery<{ success: boolean; data: WhatsAppInstance | null; message: string }>({
    queryKey: ['whatsapp', buildingId],
    queryFn: async () => {
      console.log('Fetching WhatsApp instance:', buildingId);
      try {
        const response = await fetch(`/buildings/whatsapp/${buildingId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      console.log('API Response:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Error al cargar la instancia de WhatsApp: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('WhatsApp instance data:', data);
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
    },
    enabled: !!buildingId,
  });

  // Ya no necesitamos estos handlers porque WhatsAppConfig maneja todo internamente



  const isLoading = buildingLoading || whatsappLoading;

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );

  if (error) {
    console.error('Error loading building:', error);
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <p className="text-red-600 font-medium">Error al cargar los datos del edificio</p>
          <p className="text-sm text-gray-500">{error instanceof Error ? error.message : 'Error desconocido'}</p>
        </div>
      </div>
    );
  }

  if (!building) return null;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Configuración del Consorcio</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Configuración de WhatsApp */}
        <WhatsAppConfig
          buildingId={buildingId!}
          whatsapp={whatsappInstance?.data}
        />

        {/* Aquí irán otros componentes de configuración */}
      </div>
    </div>
  );
}
