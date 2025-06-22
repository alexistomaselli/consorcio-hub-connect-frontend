
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import ClaimDetailComponent from '@/components/Claims/ClaimDetail';
import { Button } from '@/components/ui/button';
import { Claim } from '@/types/claim';

const ClaimDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchClaim = async () => {
      if (!id || !currentUser?.buildingId) return;
      
      try {
        const { data } = await api.get<Claim>(`/buildings/${currentUser.buildingId}/claims/${id}`);
        setClaim(data);
        
        // Si el usuario no es admin y no es el propietario del reclamo, redirigir
        if (
          currentUser?.role !== 'BUILDING_ADMIN' && 
          currentUser?.id !== data.creatorId
        ) {
          navigate('/claims');
        }
      } catch (error) {
        console.error('Error al obtener el reclamo:', error);
        navigate('/claims');
      } finally {
        setLoading(false);
      }
    };
    
    fetchClaim();
  }, [id, currentUser, navigate]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-consorcio-gray-500">Cargando...</p>
      </div>
    );
  }
  
  if (!claim) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-consorcio-gray-500">No se encontró el reclamo</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/claims')}
          className="mr-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Detalle del Reclamo</h1>
      </div>
      
      <ClaimDetailComponent 
        claim={claim} 
        onUpdate={async () => {
          if (id && currentUser?.buildingId) {
            const { data } = await api.get<Claim>(`/buildings/${currentUser.buildingId}/claims/${id}`);
            setClaim(data);
          }
        }}
      />
    </div>
  );
};

export default ClaimDetail;
