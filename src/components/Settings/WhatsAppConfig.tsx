import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2, HelpCircle, ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from 'sonner';
import { ExistingInstance } from './ExistingInstance';
import { evolutionService } from '@/services/evolution';
import { supabase } from '@/lib/supabase';

import { WhatsAppInstance, WhatsAppInstanceResponse, WhatsappStatus } from "@/types/whatsapp";

type WhatsAppConfigProps = {
  buildingId: string;
  whatsapp: WhatsAppInstance | null | undefined;
};

export function WhatsAppConfig({ buildingId, whatsapp: initialWhatsapp }: WhatsAppConfigProps): JSX.Element {
  const queryClient = useQueryClient();

  // No more webhooks
  const isLoadingConnectWebhook = false;
  const connectWebhookError = null;
  const isLoadingDeleteWebhook = false;
  const deleteWebhookError = null;

  // Local state
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [whatsappData, setWhatsappData] = useState<WhatsAppInstance | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActivePolling, setIsActivePolling] = useState(false);
  const [isNewInstance, setIsNewInstance] = useState(false);

  // 1. Fetch current building data (including whatsapp JSON)
  const { data: buildingDataResponse, isLoading: isLoadingInstance, refetch: refetchInstance } = useQuery({
    queryKey: ['whatsapp-instance', buildingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buildings')
        .select('whatsapp, name')
        .eq('id', buildingId)
        .single();

      if (error) throw error;

      let parsedWhatsapp: WhatsAppInstance | null = null;
      if (data?.whatsapp) {
        try {
          parsedWhatsapp = typeof data.whatsapp === 'string' ? JSON.parse(data.whatsapp) : data.whatsapp;
        } catch (e) {
          console.error('Error parsing whatsapp data', e);
        }
      }
      return { data: parsedWhatsapp, buildingName: data?.name };
    },
    enabled: !!buildingId,
  });

  // 2. Query for real-time status from Evolution API
  const { data: statusData, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ['whatsapp-status', buildingId],
    queryFn: async () => {
      if (!whatsappData?.instanceName) return null;

      try {
        const response = await evolutionService.getInstanceStatus(whatsappData.instanceName);
        const state = response.instance?.state;

        const isConnected = state === 'open';

        if (isConnected && isActivePolling) {
          setIsActivePolling(false);
        } else if (!isConnected && !isActivePolling) {
          setIsActivePolling(true);
        }

        if (isConnected && qrCode) {
          setQrCode(null);
          setTimeLeft(null);
          toast.success('¡Dispositivo vinculado correctamente!');
          // Update Supabase state
          await evolutionService.updateBuildingWhatsapp(buildingId, {
            ...whatsappData,
            status: 'CONNECTED'
          });
          refetchInstance();
        }

        return response;
      } catch (error) {
        console.error('Status check error:', error);
        return null;
      }
    },
    enabled: !!buildingId && !!whatsappData?.instanceName,
    refetchInterval: isActivePolling ? 5000 : 30000,
  });

  const isInstanceLoading = isLoadingInstance || statusLoading;

  // Actualizar el estado local cuando cambie la instancia
  useEffect(() => {
    if (buildingDataResponse?.data) {
      setWhatsappData(buildingDataResponse.data);
    }
  }, [buildingDataResponse?.data]);

  // Ya no necesitamos mapear el estado manualmente ya que la API nos devuelve el estado correcto
  // Esta función se mantiene por compatibilidad con el código existente
  const getWhatsappStatus = (status?: string): WhatsappStatus => {
    if (!status) return 'DISCONNECTED';
    if (status === 'CONNECTED') return 'CONNECTED';
    if (status === 'PENDING') return 'PENDING';
    return 'DISCONNECTED';
  };

  // Usar el estado más actualizado disponible (preferimos el que viene del endpoint de status)
  const currentWhatsappData = useMemo(() => {
    if (!buildingDataResponse?.data) return null;

    // Dar prioridad al estado del Evolution API que es más actualizado
    const evolutionState = statusData?.instance?.state;
    const mappedStatus: WhatsappStatus = evolutionState === 'open' ? 'CONNECTED' : 'DISCONNECTED';

    return {
      ...buildingDataResponse.data,
      status: mappedStatus,
    };
  }, [buildingDataResponse?.data, statusData]);

  useEffect(() => {
    if (currentWhatsappData && (!whatsappData || currentWhatsappData.status !== whatsappData.status)) {
      setWhatsappData(currentWhatsappData);
      // Solo loguear cuando cambia el estado de conexión
      console.debug('[WhatsApp Status Change]:', {
        instanceName: currentWhatsappData.instanceName,
        previousStatus: whatsappData?.status || 'NONE',
        newStatus: currentWhatsappData.status,
        timestamp: new Date().toISOString()
      });
    }
  }, [currentWhatsappData]);

  // Efecto para el contador y chequeo de estado
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (qrCode && timeLeft !== null && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(time => {
          if (time === null || time <= 1) {
            setQrCode(null);
            return null;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [qrCode, timeLeft]);

  type QrResponse = {
    success: boolean;
    qr_base64?: string;
    error?: string;
  };

  // Función para obtener el código QR
  const handleGetQr = async (): Promise<void> => {
    if (!whatsappData?.instanceName) return;

    setIsActivePolling(true);
    refetchStatus();

    try {
      setIsGeneratingQr(true);
      setError(null);

      const response = await evolutionService.getConnectQr(whatsappData.instanceName);

      if (response.base64) {
        setQrCode(response.base64);
        setTimeLeft(40);
        refetchInstance();
      } else {
        throw new Error('No se pudo generar el código QR');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error('Error al obtener QR: Instancia posiblemente no inicializada correctamente.');
    } finally {
      setIsGeneratingQr(false);
    }
  };

  // Actualizar el estado de la instancia cuando cambia el status
  useEffect(() => {
    if (buildingDataResponse?.data && statusData?.instance?.state) {
      const newStatus: WhatsappStatus = statusData.instance.state === 'open' ? 'CONNECTED' : 'DISCONNECTED';
      if (buildingDataResponse.data.status !== newStatus) {
        setWhatsappData({
          ...buildingDataResponse.data,
          status: newStatus
        });
      }
    }
  }, [statusData, buildingDataResponse?.data]);

  // Crear instancia
  const { mutate: createInstance, isPending: isCreating } = useMutation({
    mutationFn: async () => {
      const instanceName = `${buildingDataResponse?.buildingName?.replace(/\s+/g, '_')}_${buildingId}`;
      const response = await evolutionService.createInstance(instanceName);

      const newWhatsapp: WhatsAppInstance = {
        id: crypto.randomUUID(),
        buildingId,
        instanceName,
        status: 'DISCONNECTED',
        n8nFlowStatus: 'COMPLETED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        connectionAttempts: 0
      };

      await evolutionService.updateBuildingWhatsapp(buildingId, newWhatsapp);
      return newWhatsapp;
    },
    onSuccess: () => {
      setIsNewInstance(true);
      refetchInstance();
      toast.success('Instancia creada correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Sync status with whatsapp prop and buildingQuery data
  useEffect(() => {
    if (whatsappData?.status === 'CONNECTED') {
      // Si está conectado, limpiar el QR y el timer
      setQrCode(null);
      setTimeLeft(null);
      toast.success('WhatsApp conectado correctamente');
      // Detener el polling una vez conectado
      // queryClient.removeQueries({ queryKey: ['whatsapp', buildingId] });
    } else if (whatsappData?.status === 'PENDING') {
      // No hacer nada
    }
  }, [whatsappData?.status]);

  const handleDelete = async () => {
    if (!whatsappData?.instanceName || !buildingId) {
      toast.error('Faltan datos para eliminar la instancia');
      return;
    }

    try {
      setIsLoading(true);
      await evolutionService.deleteInstance(whatsappData.instanceName);
      await evolutionService.updateBuildingWhatsapp(buildingId, null);

      setWhatsappData(null);
      queryClient.setQueryData(['whatsapp-instance', buildingId], { data: null });
      refetchInstance();
      refetchStatus();

      toast.success('Instancia eliminada correctamente');
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Error al eliminar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">


      <div className="space-y-6">
        {/* Card 1: Crear Instancia */}
        <div className="bg-white shadow sm:rounded-lg p-6">
          <div className="flex items-center gap-x-3">
            <MessageCircle
              className="h-6 w-6 text-green-600"
              aria-hidden="true"
            />
            <div className="flex items-center gap-x-2">
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                1. Crear Instancia de WhatsApp
              </h3>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <Collapsible className="mb-4">
              <div className="flex items-center space-x-2">
                <HelpCircle className="h-4 w-4 text-blue-500" />
                <CollapsibleTrigger className="flex items-center text-sm text-blue-600 hover:text-blue-700">
                  ¿Qué es una instancia de WhatsApp?
                  <ChevronDown className="h-4 w-4 ml-1" />
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <div className="mt-2 bg-blue-50 border-l-4 border-blue-400 p-4">
                  <p className="text-sm text-blue-600">
                    Es una conexión única para este consorcio que permite:
                  </p>
                  <ul className="mt-2 text-sm text-blue-600 list-disc list-inside">
                    <li>Enviar notificaciones a los propietarios</li>
                    <li>Recibir mensajes y consultas</li>
                    <li>Mantener todas las conversaciones organizadas en un solo lugar</li>
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="mt-4">
              {whatsappData ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    Instancia: {whatsappData.instanceName}
                  </p>
                  <div className="flex space-x-4 mt-4">
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Eliminando...
                        </>
                      ) : (
                        'Eliminar Instancia'
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => createInstance()}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando instancia...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Crear Instancia de WhatsApp
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Vincular Dispositivo */}
        <div className="bg-white shadow sm:rounded-lg p-6">
          <div className="flex items-center gap-x-3">
            <MessageCircle
              className="h-6 w-6 text-green-600"
              aria-hidden="true"
            />
            <div className="flex items-center gap-x-2">
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                2. Vincular Dispositivo
              </h3>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <Collapsible className="mb-4">
              <div className="flex items-center space-x-2">
                <HelpCircle className="h-4 w-4 text-blue-500" />
                <CollapsibleTrigger className="flex items-center text-sm text-blue-600 hover:text-blue-700">
                  ¿Qué necesito para vincular WhatsApp?
                  <ChevronDown className="h-4 w-4 ml-1" />
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <div className="mt-2 bg-blue-50 border-l-4 border-blue-400 p-4">
                  <ul className="text-sm text-blue-600 list-disc list-inside space-y-1">
                    <li>Un teléfono con WhatsApp instalado</li>
                    <li>Conexión a internet en el teléfono</li>
                    <li>Escanear un código QR con la cámara de WhatsApp (similar a WhatsApp Web)</li>
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Mostrar ExistingInstance solo si hay una instancia en la base de datos */}
            {whatsappData?.id ? (
              <ExistingInstance
                buildingId={buildingId}
                instance={whatsappData}
                onRefresh={() => {
                  refetchInstance();
                  refetchStatus();
                }}
              />
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Primero debes crear una instancia de WhatsApp para poder vincular un dispositivo.
                </p>
                <Button
                  disabled={true}
                  className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Vincular Dispositivo
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
