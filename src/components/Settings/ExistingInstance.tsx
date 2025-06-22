import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useN8nWebhook } from '@/hooks/useN8nWebhook';


import { WhatsAppInstance, WhatsAppInstanceResponse } from '@/types/whatsapp';

const WHATSAPP_API = `${import.meta.env.VITE_API_BASE_URL}/buildings/whatsapp`;

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

  // Query para obtener el estado actualizado de la instancia
  const { data: instance } = useQuery<WhatsAppInstanceResponse, Error, WhatsAppInstance>({
    queryKey: ['whatsapp-instance', buildingId],
    queryFn: async () => {
      const response = await fetch(`${WHATSAPP_API}/${buildingId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener la información de la instancia');
      }

      return response.json();
    },
    select: (data) => data.data,
    initialData: { data: initialInstance, success: true, message: 'Instancia cargada' },
    refetchInterval: initialInstance?.status === 'CONNECTED' ? 120000 : 10000 // 2 min si está conectado, 10 seg si no
  });
  
  // Obtener los webhooks necesarios
  const { data: connectWebhook } = useN8nWebhook('whatsapp_connect');
  const { data: disconnectWebhook } = useN8nWebhook('whatsapp_disconnect');

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
          instanceName: instance.instanceName
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message?.includes('READONLY')) {
          throw new Error('Error al vincular: El servidor de WhatsApp está en modo de solo lectura. Por favor, intente más tarde o contacte al soporte técnico.');
        }
        throw new Error('Error al generar el código QR');
      }

      const data = await response.json();
      console.log('Respuesta de n8n:', data);

      if (data.success && data.qr_base64) {
      try {
        // Obtener solo la parte de datos del base64 (por si viene con el prefijo data:image)
        const base64Data = data.qr_base64.includes(',') 
          ? data.qr_base64.split(',')[1] 
          : data.qr_base64;

        // Limpiar el string base64
        let cleanBase64 = base64Data
          .replace(/\s/g, '') // Eliminar espacios y saltos de línea
          .trim(); // Eliminar espacios al inicio y final

        console.log('QR Code base64 original:', data.qr_base64.substring(0, 50) + '...');
        console.log('QR Code base64 limpio:', cleanBase64.substring(0, 50) + '...');
        console.log('Longitud del base64:', cleanBase64.length);
        
        setQrCode(cleanBase64);
        setTimeLeft(40); // Iniciar el contador en 40 segundos
        onRefresh(); // Actualizar el estado de la instancia
      } catch (error) {
        console.error('Error procesando QR base64:', error);
        throw new Error('Error al procesar el código QR: ' + error.message);
      }
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

  // Desconectar instancia
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      if (!disconnectWebhook?.data?.data?.prodUrl) {
        throw new Error('No se encontró el webhook de desconexión');
      }

      if (!instance.instanceName) {
        throw new Error('No se encontró el nombre de la instancia');
      }

      try {
        // Desconectar en Evolution API a través de n8n
        const n8nResponse = await fetch(disconnectWebhook.data.data.prodUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ instanceName: instance.instanceName }),
        });

        const n8nData = await n8nResponse.json();
        if (!n8nResponse.ok || !n8nData.success) {
          throw new Error(n8nData.message || 'Error al desconectar la instancia en Evolution API');
        }

        return n8nData;
      } catch (error) {
        console.error('Error al desconectar:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Instancia desconectada correctamente');
      onRefresh();
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
