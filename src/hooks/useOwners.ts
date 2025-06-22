import { useState, useEffect } from 'react';
import { Owner } from '@/types';
import { OwnerService } from '@/services/owners';
import { useToast } from '@/components/ui/use-toast';

export function useOwners(buildingId: string) {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchOwners = async () => {
    try {
      setIsLoading(true);
      const data = await OwnerService.getOwners(buildingId);
      setOwners(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los propietarios",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (buildingId) {
      fetchOwners();
    }
  }, [buildingId]);

  return {
    owners,
    isLoading,
    refetchOwners: fetchOwners
  };
}
