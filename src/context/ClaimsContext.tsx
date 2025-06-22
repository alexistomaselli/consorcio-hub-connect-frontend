
import React, { createContext, useContext, useState } from 'react';
import { Claim, ClaimStatus, ClaimCategory, ClaimComment } from '../types';

interface ClaimsContextType {
  claims: Claim[];
  loading: boolean;
  createClaim: (claimData: ClaimCreationData) => Promise<void>;
  updateClaimStatus: (claimId: string, status: ClaimStatus) => Promise<void>;
  addComment: (claimId: string, content: string, userId: string) => Promise<void>;
  getClaimsByBuildingId: (buildingId: string) => Promise<Claim[]>;
  getClaimsByUserId: (userId: string) => Promise<Claim[]>;
  getClaimById: (claimId: string) => Promise<Claim>;
}

interface ClaimCreationData {
  title: string;
  description: string;
  category: ClaimCategory;
  buildingId: string;
  unitId?: string;
  userId: string;
  images?: string[];
}

const ClaimsContext = createContext<ClaimsContextType | undefined>(undefined);

// Mock data for demonstration purposes
const MOCK_CLAIMS: Claim[] = [
  {
    id: '1',
    title: 'Filtración de agua en baño',
    description: 'Hay una filtración de agua en el baño principal, viene del departamento de arriba.',
    status: 'pending',
    category: 'plumbing',
    buildingId: '1',
    unitId: '101',
    userId: '2',
    createdAt: new Date(2023, 3, 15).toISOString(),
    updatedAt: new Date(2023, 3, 15).toISOString(),
    comments: []
  },
  {
    id: '2',
    title: 'Luz del pasillo no funciona',
    description: 'La luz del pasillo del tercer piso no está funcionando desde ayer.',
    status: 'in_progress',
    category: 'electrical',
    buildingId: '1',
    unitId: '305',
    userId: '2',
    assignedToId: '1',
    createdAt: new Date(2023, 3, 12).toISOString(),
    updatedAt: new Date(2023, 3, 14).toISOString(),
    comments: [
      {
        id: '1',
        claimId: '2',
        userId: '1',
        content: 'Se contactó al electricista, vendrá mañana.',
        createdAt: new Date(2023, 3, 14).toISOString(),
        updatedAt: new Date(2023, 3, 14).toISOString(),
      }
    ]
  },
  {
    id: '3',
    title: 'Ascensor detenido',
    description: 'El ascensor principal está detenido en el piso 2 y no responde.',
    status: 'resolved',
    category: 'elevator',
    buildingId: '1',
    userId: '2',
    assignedToId: '1',
    createdAt: new Date(2023, 3, 10).toISOString(),
    updatedAt: new Date(2023, 3, 11).toISOString(),
    comments: [
      {
        id: '2',
        claimId: '3',
        userId: '1',
        content: 'Técnico en camino.',
        createdAt: new Date(2023, 3, 10, 14, 30).toISOString(),
        updatedAt: new Date(2023, 3, 10, 14, 30).toISOString(),
      },
      {
        id: '3',
        claimId: '3',
        userId: '1',
        content: 'Problema resuelto. Fue un fallo en el sensor de puerta.',
        createdAt: new Date(2023, 3, 11, 10, 15).toISOString(),
        updatedAt: new Date(2023, 3, 11, 10, 15).toISOString(),
      }
    ]
  }
];

export const ClaimsProvider = ({ children }: { children: React.ReactNode }) => {
  const [claims, setClaims] = useState<Claim[]>(MOCK_CLAIMS);
  const [loading, setLoading] = useState(false);

  const createClaim = async (claimData: ClaimCreationData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/claims`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(claimData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear el reclamo');
      }

      const newClaim = await response.json();
      setClaims(prev => [...prev, newClaim]);
    } catch (error) {
      console.error('Error al crear el reclamo:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateClaimStatus = async (claimId: string, status: ClaimStatus) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/claims/${claimId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar el estado del reclamo');
      }

      const updatedClaim = await response.json();
      setClaims(prev => prev.map(claim => 
        claim.id === claimId ? updatedClaim : claim
      ));
    } catch (error) {
      console.error('Error al actualizar el estado del reclamo:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (claimId: string, content: string, userId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/claims/${claimId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al agregar comentario');
      }

      const { claim } = await response.json();
      setClaims(prev => prev.map(c => 
        c.id === claimId ? claim : c
      ));
    } catch (error) {
      console.error('Error al agregar comentario:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getClaimsByBuildingId = async (buildingId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/claims?buildingId=${buildingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al obtener reclamos');
      }

      const data = await response.json();
      setClaims(data);
      return data;
    } catch (error) {
      console.error('Error al obtener reclamos:', error);
      throw error;
    }
  };

  const getClaimsByUserId = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/claims?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al obtener reclamos');
      }

      const data = await response.json();
      setClaims(data);
      return data;
    } catch (error) {
      console.error('Error al obtener reclamos:', error);
      throw error;
    }
  };

  const getClaimById = async (claimId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/claims/${claimId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al obtener reclamo');
      }

      const claim = await response.json();
      return claim;
    } catch (error) {
      console.error('Error al obtener reclamo:', error);
      throw error;
    }
  };

  return (
    <ClaimsContext.Provider 
      value={{ 
        claims,
        loading,
        createClaim,
        updateClaimStatus,
        addComment,
        getClaimsByBuildingId,
        getClaimsByUserId,
        getClaimById
      }}
    >
      {children}
    </ClaimsContext.Provider>
  );
};

export const useClaims = (): ClaimsContextType => {
  const context = useContext(ClaimsContext);
  if (context === undefined) {
    throw new Error('useClaims debe ser usado dentro de un ClaimsProvider');
  }
  return context;
};
