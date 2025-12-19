import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { WhatsAppConfig } from '@/components/Settings/WhatsAppConfig';
import { Building } from '@/types';
import { WhatsAppInstance } from '@/types/whatsapp';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';



// No necesitamos API_BASE_URL porque usamos el proxy configurado en vite.config.ts

export default function BuildingSettings() {
  console.log('Rendering BuildingSettings component');
  const { currentUser } = useAuth();
  // Si no hay usuario, mostrar error
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <p className="text-red-600 font-medium">Error de autenticación</p>
          <p className="text-sm text-gray-500">
            No hay usuario autenticado
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
      const { data, error } = await supabase
        .from('buildings')
        .select('*')
        .eq('id', buildingId)
        .single();

      if (error) {
        console.error('Error al cargar el edificio:', error);
        throw error;
      }
      return data;
    },
    enabled: !!buildingId,
  });

  const { data: whatsappInstance, isLoading: whatsappLoading, error } = useQuery<{ success: boolean; data: WhatsAppInstance | null; message: string }>({
    queryKey: ['whatsapp', buildingId],
    queryFn: async () => {
      console.log('Fetching WhatsApp instance:', buildingId);
      const { data, error } = await supabase
        .from('buildings')
        .select('whatsapp')
        .eq('id', buildingId)
        .single();

      if (error) {
        console.error('Database request error:', error);
        throw new Error(`Error al cargar datos de WhatsApp: ${error.message}`);
      }

      let parsedData: WhatsAppInstance | null = null;
      if (data?.whatsapp) {
        try {
          parsedData = JSON.parse(data.whatsapp);
        } catch (e) {
          console.error('Error parsing whatsapp data', e);
        }
      }

      return {
        success: true,
        data: parsedData,
        message: 'Loaded from Supabase'
      };
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
