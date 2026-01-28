import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import ClaimDetailComponent from '@/components/Claims/ClaimDetail';
import { Button } from '@/components/ui/button';
import { Claim } from '@/types/claim';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ClaimDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);

  // Determine where to go back
  const getBackPath = () => {
    if (location.pathname.startsWith('/my-claims')) return '/my-claims';
    if (location.pathname.startsWith('/service-claims')) return '/service-claims';
    return '/claims';
  };

  const fetchClaim = async () => {
    if (!id || !currentUser) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('claims')
        .select(`
          *,
          unit:units(id, number, floor),
          space:spaces(id, name, floor, spaceType:space_types(id, name)),
          creator:users(id, firstName, lastName, email),
          serviceProvider:service_providers(id, businessName)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error fetching claim:', error); // DEBUG
        throw error;
      }

      console.log('Claim data fetched:', data); // DEBUG

      // Map snake_case to camelCase if necessary
      const mappedData = {
        ...data,
        serviceProvider: data.serviceProvider ? {
          id: data.serviceProvider.id,
          name: data.serviceProvider.businessName
        } : null
      } as unknown as Claim;

      setClaim(mappedData);

      // Role-based access check
      const isAdmin = currentUser.role === 'BUILDING_ADMIN' || currentUser.role === 'SUPER_ADMIN';
      const isCreator = currentUser.id === mappedData.creatorId;
      const isAssignedProvider = currentUser.role === 'SERVICE_PROVIDER' && currentUser.id === mappedData.serviceProviderId;

      // Let's also check if they are the owner of the unit (for owners viewing tenant claims)
      // This requires the unit to have ownerId/tenantId but we don't have it in the join yet.
      // For now, simpler check based on creator and admin.

      if (!isAdmin && !isCreator && !isAssignedProvider) {
        console.warn('Access denied for user:', currentUser.id, 'Claim creator:', mappedData.creatorId); // DEBUG
        toast.error('No tienes permiso para ver este reclamo');
        navigate(getBackPath());
      }
    } catch (error) {
      console.error('Error fetching claim:', error);
      toast.error('No se pudo cargar el reclamo');
      navigate(getBackPath());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaim();
  }, [id, currentUser]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-slate-500 font-medium">Cargando detalles del ticket...</p>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 text-center px-4">
        <div className="bg-slate-100 p-4 rounded-full">
          <ArrowLeft className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">No se encontró el reclamo</h2>
        <p className="text-slate-500 max-w-xs">El ticket que buscas no existe o ha sido eliminado.</p>
        <Button onClick={() => navigate(getBackPath())} variant="outline">
          Volver a la lista
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl pb-10">
      <ClaimDetailComponent
        claim={claim}
        onUpdate={fetchClaim}
      />
    </div>
  );
};

export default ClaimDetailPage;
