import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';

interface WhatsappInstanceStatus {
  exists: boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useWhatsappStatus = (): WhatsappInstanceStatus => {
  const { currentUser } = useAuth();
  const [exists, setExists] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const checkWhatsappInstance = async () => {
    if (!currentUser?.buildingId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/buildings/whatsapp/${currentUser.buildingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setExists(response.ok);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error checking WhatsApp instance'));
      setExists(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkWhatsappInstance();
  }, [currentUser?.buildingId]);

  return {
    exists,
    isLoading,
    error,
    refetch: checkWhatsappInstance,
  };
};
