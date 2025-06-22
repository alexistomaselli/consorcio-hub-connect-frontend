import { useState, useEffect } from 'react';
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

const WHATSAPP_API = `${import.meta.env.VITE_API_BASE_URL}/buildings/whatsapp`;

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
  const ACTIVE_POLLING_INTERVAL = 10000;  // 10 segundos

  // Estados locales
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [whatsappData, setWhatsappData] = useState<WhatsAppInstance | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActivePolling, setIsActivePolling] = useState(false);
  const [isNewInstance, setIsNewInstance] = useState(false);



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
      const response = await fetch(`${WHATSAPP_API}/${buildingId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener la información de la instancia');
      }

      const responseData = await response.json();
     /*console.log('[WhatsApp Instance Check]', {
        url: `${WHATSAPP_API}/${buildingId}`,
        success: responseData.success,
        message: responseData.message,
        hasInstance: responseData.data !== null,
        instanceData: responseData.data,
        timestamp: new Date().toISOString()
      });*/
      return responseData; // Retornamos la respuesta completa
    },
    // La información de la instancia se refresca cuando cambia el estado
    staleTime: 0,
    refetchInterval: isActivePolling ? 10000 : 30000
  });

  // 2. Query para el estado de WhatsApp
  const { data: statusData, isLoading: statusLoading, refetch: refetchStatus } = useQuery<{ success: boolean, data: { connectionStatus: string } }, Error>({
    queryKey: ['whatsapp-status', buildingId],
    queryFn: async () => {
      if (!statusWebhook?.data?.prodUrl || !whatsappInstance?.data?.instanceName) {
        return { success: false, data: { connectionStatus: 'disconnected' } };
      }

      try {
        const response = await fetch(statusWebhook.data.prodUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ instanceName: whatsappInstance.data.instanceName }),
        });

        if (!response.ok) {
          return { success: false, data: { connectionStatus: 'error' } };
        }

        const data = await response.json();
        
        // Si la instancia está conectada, desactivar el polling rápido
        if (data.data?.connectionStatus === 'open' && (isActivePolling || isNewInstance)) {
          setIsActivePolling(false);
          setIsNewInstance(false);
        } else if (data.data?.connectionStatus !== 'open' && !isActivePolling) {
          setIsActivePolling(true);
        }
        
        // Refrescar la información de la instancia cuando cambia el estado
        refetchInstance();
        
        return data;
      } catch (error) {
        console.error('Error al obtener estado de WhatsApp:', error);
        return { success: false, data: { connectionStatus: 'error' } };
      }
    },
    enabled: Boolean(whatsappInstance?.data && statusWebhook?.data?.prodUrl),
    // El estado de la conexión necesita ser más fresco cuando estamos en polling activo
    staleTime: isActivePolling ? ACTIVE_POLLING_INTERVAL : NORMAL_POLLING_INTERVAL,
    refetchInterval: whatsappInstance?.data ? 
      (isActivePolling || isNewInstance ? ACTIVE_POLLING_INTERVAL : NORMAL_POLLING_INTERVAL) : 
      false
  });

  const isInstanceLoading = isLoadingInstance || statusLoading;

  // Actualizar el estado local cuando cambie la instancia
  useEffect(() => {
    if (whatsappInstance?.data) {
      setWhatsappData(whatsappInstance.data);
    }
  }, [whatsappInstance?.data]);

  // Mapear el estado del webhook al tipo WhatsappStatus
  const getWhatsappStatus = (connectionStatus?: string): WhatsappStatus => {
    if (!connectionStatus) return 'DISCONNECTED';
    switch (connectionStatus.toLowerCase()) {
      case 'open':
        return 'CONNECTED';
      case 'connecting':
        return 'PENDING';
      case 'close':
      case 'error':
      default:
        return 'DISCONNECTED';
    }
  };

  const currentWhatsappData = whatsappInstance?.data ? {
    ...whatsappInstance.data,
    status: getWhatsappStatus(statusData?.data?.connectionStatus)
  } : null;

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
    if (whatsappInstance?.data && statusData?.data?.connectionStatus) {
      const newStatus = getWhatsappStatus(statusData.data.connectionStatus);
      if (whatsappInstance.data.status !== newStatus) {
        // Actualizar el estado local
        setWhatsappData({
          ...whatsappInstance.data,
          status: newStatus
        });
      }
    }
  }, [statusData?.data?.connectionStatus, whatsappInstance?.data]);

  // Crear instancia
  const { mutate: createInstance, isPending: isCreating } = useMutation<WhatsAppInstance, Error>({
    mutationFn: async () => {
      const response = await fetch(`${WHATSAPP_API}/${buildingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al crear la instancia');
      }

      return response.json();
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
      const dbResponse = await fetch(`${WHATSAPP_API}/${buildingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!dbResponse.ok) {
        throw new Error('Error al eliminar la instancia de la base de datos');
      }

      const dbData = await dbResponse.json();
      if (!dbData.success) {
        throw new Error(dbData.message || 'Error al eliminar de la base de datos');
      }

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
