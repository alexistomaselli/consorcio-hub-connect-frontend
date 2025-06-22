import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function useN8nWebhook(name: string) {
  return useQuery({
    queryKey: ['n8n-webhook', name],
    queryFn: async () => {
      console.log('Fetching webhook:', {
        url: `${API_BASE_URL}/n8n-webhooks/${name}`,
        token: localStorage.getItem('token')
      });
      const response = await fetch(`${API_BASE_URL}/n8n-webhooks/${name}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error fetching webhook:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.message || 'Error al obtener el webhook');
      }
      const data = await response.json();
      console.log('Webhook response:', { name, data });
      return data;
    },
    staleTime: Infinity, // Los webhooks no cambian frecuentemente
    gcTime: 1000 * 60 * 60 // Cache por 1 hora
  });
}
