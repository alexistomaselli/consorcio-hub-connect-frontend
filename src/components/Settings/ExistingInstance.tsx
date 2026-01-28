import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { evolutionService } from '@/services/evolution';
import { supabase } from '@/lib/supabase';

import { WhatsAppInstance, WhatsAppInstanceResponse } from '@/types/whatsapp';

interface ExistingInstanceProps {
  buildingId: string;
  instance: WhatsAppInstance;
  onRefresh: () => void;
}

export function ExistingInstance({ buildingId, instance: initialInstance, onRefresh }: ExistingInstanceProps): JSX.Element {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado local para mantener la instancia actualizada
  const [instance, setInstance] = useState<WhatsAppInstance>(initialInstance);

  // Query para obtener el estado actualizado de la instancia usando Evolution API
  const { data: statusData, refetch: refetchStatus } = useQuery({
    queryKey: ['whatsapp-status-instance', buildingId],
    queryFn: async () => {
      console.log(`[ExistingInstance] Consultando estado para ${instance.instanceName}...`);
      return evolutionService.getInstanceStatus(instance.instanceName);
    },
    refetchInterval: 10000,
    enabled: !!buildingId && !!instance.instanceName
  });

  // Actualizar el estado local cuando cambian los datos de status
  useEffect(() => {
    if (statusData?.instance?.state) {
      const evolutionState = statusData.instance.state;
      const newStatus = evolutionState === 'open' ? 'CONNECTED' : 'DISCONNECTED';

      if (instance.status !== newStatus) {
        setInstance(prev => ({ ...prev, status: newStatus }));
        // Sync with Supabase
        evolutionService.updateBuildingWhatsapp(buildingId, {
          ...instance,
          status: newStatus
        });
      }
    }
  }, [statusData]);

  // Actualizar también cuando cambia initialInstance desde las props
  useEffect(() => {
    setInstance(initialInstance);
  }, [initialInstance?.id, initialInstance?.status]);



  // Efecto para el contador del QR
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    // Timer para el contador si hay QR
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

  // Función para obtener el código QR
  const handleGetQr = async () => {
    try {
      setIsGeneratingQr(true);
      setError(null);

      const response = await evolutionService.getConnectQr(instance.instanceName);

      if (response.base64) {
        setQrCode(response.base64);
        setTimeLeft(40);
        onRefresh();
      } else {
        throw new Error('No se pudo obtener el código QR. Intente nuevamente.');
      }
    } catch (err: any) {
      setError(err.message || 'Error al conectar con Evolution API');
      toast.error('Error al generar QR. Asegúrese de que la instancia esté activa.');
    } finally {
      setIsGeneratingQr(false);
    }
  };

  // Desconectar instancia
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      if (!instance.instanceName) throw new Error('Nombre de instancia no encontrado');
      await evolutionService.logoutInstance(instance.instanceName);
      await evolutionService.updateBuildingWhatsapp(buildingId, {
        ...instance,
        status: 'DISCONNECTED'
      });
    },
    onSuccess: () => {
      toast.success('Instancia desconectada correctamente');
      onRefresh();
      refetchStatus();
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
      toast.error(`Error al desconectar: ${error.message}`);
    }
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Estado: <span
          className={`font-medium ${instance.status === 'CONNECTED'
            ? 'text-green-600'
            : instance.status === 'PENDING'
              ? 'text-yellow-600'
              : 'text-red-600'
            }`}
        >
          {instance.status === 'CONNECTED'
            ? 'CONECTADO'
            : instance.status === 'PENDING'
              ? 'CONECTANDO'
              : 'DESCONECTADO'}
        </span>
      </p>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {qrCode && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg shadow">
              {qrCode ? (
                <img
                  src={`data:image/png;base64,${qrCode}`}
                  onError={(e) => {
                    console.error('Error al cargar el QR:', e);
                    setError('Error al mostrar el código QR');
                    setQrCode(null);
                  }}
                  alt="QR Code"
                  className="w-64 h-64"
                />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-500">QR no disponible</p>
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-center text-gray-500">
            Tiempo restante: {timeLeft} segundos
          </p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <Button
          onClick={handleGetQr}
          disabled={isGeneratingQr || instance.status === 'CONNECTED'}
          className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingQr ? (
            <>
              <Loader2 className="h-4 w-4 mr-2" />
              Generando QR...
            </>
          ) : instance.status === 'CONNECTED' ? (
            'Dispositivo Vinculado ✓'
          ) : (
            'Vincular Dispositivo'
          )}
        </Button>

        {instance.status === 'CONNECTED' && (
          <Button
            onClick={() => disconnectMutation.mutate()}
            disabled={disconnectMutation.isPending}
            variant="destructive"
            className="inline-flex items-center"
          >
            {disconnectMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2" />
                Desconectando...
              </>
            ) : (
              'Desconectar'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
