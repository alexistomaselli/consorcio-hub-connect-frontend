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
import { useN8nWebhook } from '@/hooks/useN8nWebhook';
import { ExistingInstance } from './ExistingInstance';
import { api } from '@/lib/api'; // Importar el cliente API centralizado

import { WhatsAppInstance, WhatsAppInstanceResponse, WhatsappStatus } from "@/types/whatsapp";

type WhatsAppConfigProps = {
  buildingId: string;
  whatsapp: WhatsAppInstance | null | undefined;
};

export function WhatsAppConfig({ buildingId, whatsapp: initialWhatsapp }: WhatsAppConfigProps): JSX.Element {
  const queryClient = useQueryClient();

  // Obtener los webhooks necesarios
  const { data: connectWebhook, isLoading: isLoadingConnectWebhook, error: connectWebhookError } = useN8nWebhook('whatsapp_connect');
  const { data: deleteWebhook, isLoading: isLoadingDeleteWebhook, error: deleteWebhookError } = useN8nWebhook('whatsapp_delete_instance');
  const { data: statusWebhook } = useN8nWebhook('whatsapp_get_status');

  // Limpiar error cuando se carga el webhook
  useEffect(() => {
    if (!isLoadingConnectWebhook && connectWebhook?.data?.data?.prodUrl) {
      setError(null);
    }
  }, [isLoadingConnectWebhook, connectWebhook]);

  // Constantes para los intervalos de polling
  const NORMAL_POLLING_INTERVAL = 120000; // 2 minutos
  const ACTIVE_POLLING_INTERVAL = 5000;   // 5 segundos - más frecuente para QR

  // Estados locales
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [whatsappData, setWhatsappData] = useState<WhatsAppInstance | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActivePolling, setIsActivePolling] = useState(false);
  const [isNewInstance, setIsNewInstance] = useState(false);
  
  // Forzar una verificación de estado al cargar el componente
  useEffect(() => {
    console.log('WhatsAppConfig mounted - Verificando estado inicial...');
    if (buildingId) {
      const initialCheck = setTimeout(() => {
        refetchStatus?.();
        refetchInstance?.();
      }, 1000);
      
      return () => clearTimeout(initialCheck);
    }
  }, [buildingId]);



  // Manejar errores de los webhooks
  useEffect(() => {
    if (connectWebhookError) {
      setError('Error al obtener el webhook de conexión');
      console.error('Error en webhook de conexión:', connectWebhookError);
    }
  }, [connectWebhookError]);

  useEffect(() => {
    if (deleteWebhookError) {
      setError('Error al obtener el webhook de eliminación');
      console.error('Error en webhook de eliminación:', deleteWebhookError);
    }
  }, [deleteWebhookError]);

  // Debug webhooks
  useEffect(() => {
    console.log('Estado del webhook de conexión:', {
      isLoading: isLoadingConnectWebhook,
      error: connectWebhookError,
      webhook: connectWebhook,
      webhookUrl: connectWebhook?.data?.data?.prodUrl
    });
  }, [connectWebhook, isLoadingConnectWebhook, connectWebhookError]);

  // Debug webhooks
  useEffect(() => {
    console.log('Estado del webhook de eliminación:', {
      isLoading: isLoadingDeleteWebhook,
      error: deleteWebhookError,
      webhook: deleteWebhook
    });
  }, [deleteWebhook, isLoadingDeleteWebhook, deleteWebhookError]);

  // 1. Primero, obtener la información de la instancia
  const { data: whatsappInstance, isLoading: isLoadingInstance, error: instanceError, refetch: refetchInstance } = useQuery<WhatsAppInstanceResponse, Error>({
    queryKey: ['whatsapp-instance', buildingId],
    queryFn: async (): Promise<WhatsAppInstanceResponse> => {
      // Usar el cliente API centralizado en lugar de fetch directo
      const response = await api.get<WhatsAppInstanceResponse>(`/buildings/whatsapp/${buildingId}`);
      
      const responseData: WhatsAppInstanceResponse = response.data;
      console.log('[WhatsApp Instance Check]', {
        buildingId,
        instance: responseData.data,
        timestamp: new Date().toISOString()
      });
      return responseData; // Retornamos la respuesta completa
    },
    // La información de la instancia se refresca cuando cambia el estado
    staleTime: 0,
    refetchInterval: isActivePolling ? 5000 : 60000 // Más frecuente en modo activo (5s) y cada minuto en modo normal
  });

  // 2. Query para el estado de WhatsApp usando el endpoint directo en lugar del webhook
  const { data: statusData, isLoading: statusLoading, refetch: refetchStatus } = useQuery<{ success: boolean, data: WhatsAppInstance }, Error>({
    queryKey: ['whatsapp-status', buildingId],
    queryFn: async () => {
      if (!buildingId) {
        // Incluso si no tenemos whatsappInstance aún, consultamos el estado para detectar cuando se crea
        console.log('[WhatsApp Status Check] No hay instancia local, pero consultando de todas formas');
        return { success: false, data: { status: 'DISCONNECTED' } as WhatsAppInstance };
      }

      try {
        // Usar el endpoint directo de la API en lugar del webhook
        console.log(`[WhatsApp Status Check] Consultando estado para ${buildingId}...`);
        const response = await api.get<{ success: boolean, data: WhatsAppInstance, message: string }>(
          `/buildings/whatsapp/status/${buildingId}`
        );

        if (!response.data.success || !response.data.data) {
          console.log('[WhatsApp Status Check] Respuesta sin éxito:', response.data);
          return { success: false, data: { status: 'DISCONNECTED' } as WhatsAppInstance };
        }

        const data = response.data;
        console.log('[WhatsApp Status Check] Estado actual:', {
          buildingId,
          instanceName: data.data.instanceName,
          status: data.data.status,
          evolutionApiStatus: data.data.evolutionApiStatus,
          timestamp: new Date().toISOString()
        });
        
        // Si la instancia está CONNECTED, cambiar a polling normal
        // Si está DISCONNECTED, usar polling rápido
        // Esto garantiza que detectemos los cambios rápidamente
        const isConnected = data.data.status === 'CONNECTED';
        
        if (isConnected && isActivePolling) {
          console.log('[WhatsApp Status Check] Cambiando a polling normal (dispositivo conectado)');
          setIsActivePolling(false);
        } else if (!isConnected && !isActivePolling) {
          console.log('[WhatsApp Status Check] Cambiando a polling activo (dispositivo desconectado)');
          setIsActivePolling(true);
        }
        
        // Si hay un código QR activo y el estado es CONNECTED, significa que se escaneó exitosamente
        if (isConnected && qrCode) {
          console.log('[WhatsApp Status Check] Dispositivo vinculado correctamente - QR escaneado');
          setQrCode(null);
          setTimeLeft(null);
          toast.success('¡Dispositivo vinculado correctamente!');
        }
        
        // Actualizar el estado local si es diferente
        if (whatsappData?.status !== data.data.status) {
          console.log(`[WhatsApp Status Check] Actualizando estado local: ${whatsappData?.status || 'null'} -> ${data.data.status}`);
          // Actualizar inmediatamente el estado local para mejor UX
          setWhatsappData(prevData => ({
            ...prevData,
            ...data.data
          }));
        }
        
        return data;
      } catch (error) {
        console.error('[WhatsApp Status Check] Error:', error);
        return { success: false, data: { status: 'DISCONNECTED' } as WhatsAppInstance };
      }
    },
    // SIEMPRE habilitado si tenemos un buildingId, incluso sin instancia
    enabled: Boolean(buildingId),
    // El estado de la conexión necesita ser más fresco cuando estamos en polling activo
    staleTime: 0, // Siempre consulta la última versión
    refetchInterval: isActivePolling ? ACTIVE_POLLING_INTERVAL : NORMAL_POLLING_INTERVAL,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  const isInstanceLoading = isLoadingInstance || statusLoading;

  // Actualizar el estado local cuando cambie la instancia
  useEffect(() => {
    if (whatsappInstance?.data) {
      setWhatsappData(whatsappInstance.data);
    }
  }, [whatsappInstance?.data]);

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
    if (!whatsappInstance?.data) return null;
    
    // Dar prioridad al estado del endpoint /status que es más actualizado
    return {
      ...whatsappInstance.data,
      // Si tenemos datos de statusData, usamos su estado que es más actualizado
      status: statusData?.data?.status || whatsappInstance.data.status,
      evolutionApiStatus: statusData?.data?.evolutionApiStatus || whatsappInstance.data.evolutionApiStatus
    };
  }, [whatsappInstance?.data, statusData?.data]);

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
    // Activar el polling rápido cuando se intenta vincular
    setIsActivePolling(true);
    
    // Asegurarse de iniciar las verificaciones de estado inmediatamente
    refetchStatus();

    // Debug webhook
    console.log('Estado del webhook al intentar vincular:', {
      connectWebhook,
      data: connectWebhook?.data,
      innerData: connectWebhook?.data?.data,
      prodUrl: connectWebhook?.data?.data?.prodUrl
    });

    if (!connectWebhook?.data?.data?.prodUrl) {
      setError('No se pudo obtener la URL del webhook');
      return;
    }

    try {
      setIsGeneratingQr(true);
      setError(null);

      const response = await fetch(connectWebhook.data.data.prodUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buildingId,
          instanceName: whatsappData?.instanceName,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al generar el código QR');
      }

      const data = await response.json() as QrResponse;
      if (data.success && data.qr_base64) {
        setQrCode(data.qr_base64);
        setTimeLeft(40); // Iniciar el contador en 40 segundos
        refetchInstance(); // Actualizar el estado de la instancia
        
        // Iniciar verificaciones frecuentes del estado mientras el QR está activo
        const qrStatusCheck = setInterval(() => {
          console.log('Verificando estado mientras el QR está activo...');
          refetchStatus();
        }, 3000); // Verificar cada 3 segundos
        
        // Limpiar el intervalo después de 40 segundos (tiempo de vida del QR)
        setTimeout(() => clearInterval(qrStatusCheck), 41000);
      } else {
        throw new Error('No se pudo generar el código QR');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsGeneratingQr(false);
    }
  };

  // Actualizar el estado de la instancia cuando cambia el status
  useEffect(() => {
    if (whatsappInstance?.data && statusData?.data?.status) {
      // Ya no necesitamos convertir el estado porque la API ya lo devuelve en el formato correcto
      const newStatus = statusData.data.status;
      if (whatsappInstance.data.status !== newStatus) {
        // Actualizar el estado local
        setWhatsappData({
          ...whatsappInstance.data,
          status: newStatus
        });
      }
    }
  }, [statusData?.data?.status, whatsappInstance?.data]);

  // Crear instancia
  const { mutate: createInstance, isPending: isCreating } = useMutation<WhatsAppInstance, Error>({
    mutationFn: async () => {
      // Logs para depuración
      console.log('=== DEBUGGING CREATE INSTANCE API CALL ===');
      console.log('API Base URL:', (api.defaults.baseURL));
      console.log('Building ID:', buildingId);
      
      try {
        // Usar el cliente API centralizado en lugar de fetch directo
        const response = await api.post(`/buildings/whatsapp/${buildingId}`);

        // Log de respuesta
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        
        // Asegúrate de que coincida con el tipo WhatsAppInstance
        return response.data as WhatsAppInstance;
      } catch (error) {
        console.error('API error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      setIsNewInstance(true); // Marcar como instancia nueva
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
    console.log('Debug eliminar instancia:', {
      webhookUrl: deleteWebhook?.data?.data?.prodUrl,
      instanceName: whatsappInstance?.data?.instanceName,
      buildingId
    });
  
    if (!deleteWebhook?.data?.data?.prodUrl || !whatsappInstance?.data?.instanceName || !buildingId) {
      toast.error('Error: Faltan datos necesarios para eliminar la instancia');
      return;
    }

    try {
      setIsLoading(true);
      
      // 1. Primero eliminar en Evolution API a través de n8n
      console.log('Eliminando instancia en Evolution API...');
      const n8nResponse = await fetch(deleteWebhook.data.data.prodUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceName: whatsappInstance.data.instanceName }),
      });

      if (!n8nResponse.ok) {
        throw new Error('Error al eliminar la instancia en Evolution API');
      }

      const n8nData = await n8nResponse.json();
      if (!n8nData.success) {
        throw new Error(n8nData.data?.message || 'Error al eliminar en Evolution API');
      }

      // 2. Si Evolution API se eliminó correctamente, eliminar de nuestra base de datos
      console.log('Eliminando instancia de la base de datos...');
      // Usar el cliente API centralizado en lugar de fetch directo
      await api.delete(`/buildings/whatsapp/${buildingId}`);
      
      // El cliente API ya maneja los errores HTTP automáticamente

      // Actualizar el estado local y la caché
      setWhatsappData(null);
      queryClient.setQueryData(['whatsapp-instance', buildingId], {
        success: true,
        data: null,
        message: 'No hay instancia configurada'
      });
      
      // Invalidar las queries para forzar una recarga
      queryClient.invalidateQueries({ queryKey: ['whatsapp-instance', buildingId] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-status', buildingId] });
      
      toast.success('Instancia eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar la instancia:', error);
      toast.error(error instanceof Error ? error.message : 'Error al eliminar la instancia');
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
