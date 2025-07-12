import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../lib/api';

interface Building {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  schema?: string;
}

interface BuildingContextType {
  currentBuilding: Building | null;
  setCurrentBuilding: React.Dispatch<React.SetStateAction<Building | null>>;
  buildings: Building[];
  setBuildings: React.Dispatch<React.SetStateAction<Building[]>>;
  loading: boolean;
}

const BuildingContext = createContext<BuildingContextType | undefined>(undefined);

interface BuildingProviderProps {
  children: ReactNode;
}

export const BuildingProvider: React.FC<BuildingProviderProps> = ({ children }) => {
  const [currentBuilding, setCurrentBuilding] = useState<Building | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Cargar datos reales de edificios para el usuario
  useEffect(() => {
    const loadBuildings = async () => {
      if (currentUser) {
        setLoading(true);
        try {
          // Si el usuario es un BUILDING_ADMIN, usamos su buildingId directamente
          if (currentUser.role === 'BUILDING_ADMIN' && currentUser.buildingId) {
            console.log(`[BuildingContext] Usuario es BUILDING_ADMIN con buildingId: ${currentUser.buildingId}`);
            
            try {
              // Obtener la información del edificio desde la API
              const response = await api.get(`/buildings/${currentUser.buildingId}`);
              const buildingData = response.data as Building;
              
              if (buildingData) {
                const building: Building = {
                  id: buildingData.id,
                  name: buildingData.name,
                  address: buildingData.address || '',
                  city: buildingData.city,
                  state: buildingData.state,
                  country: buildingData.country,
                  schema: buildingData.schema
                };
                
                setBuildings([building]);
                setCurrentBuilding(building);
                console.log('[BuildingContext] Edificio actual cargado:', building);
              }
            } catch (err) {
              console.error('[BuildingContext] Error al cargar el edificio:', err);
            }
          } 
          // Si el usuario es OWNER, podría tener acceso a múltiples edificios
          else if (currentUser.role === 'OWNER') {
            console.log(`[BuildingContext] Usuario es OWNER, buscando edificios asociados...`);
            
            try {
              // Obtener todos los edificios a los que tiene acceso el propietario
              const response = await api.get(`/owners/${currentUser.id}/buildings`);
              const ownerBuildings = response.data as Building[];
              
              if (ownerBuildings && ownerBuildings.length > 0) {
                setBuildings(ownerBuildings);
                setCurrentBuilding(ownerBuildings[0]); // Seleccionamos el primero por defecto
                console.log('[BuildingContext] Edificios del propietario cargados:', ownerBuildings);
              }
            } catch (err) {
              console.error('[BuildingContext] Error al cargar edificios del propietario:', err);
            }
          }
          // Fallback en caso de que no se pueda cargar la información
          else {
            console.warn('[BuildingContext] No se pudo determinar los edificios para el usuario actual');
          }
        } catch (error) {
          console.error('[BuildingContext] Error cargando edificios:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadBuildings();
  }, [currentUser]);

  return (
    <BuildingContext.Provider 
      value={{ 
        currentBuilding, 
        setCurrentBuilding, 
        buildings, 
        setBuildings, 
        loading 
      }}
    >
      {children}
    </BuildingContext.Provider>
  );
};

export const useBuilding = () => {
  const context = useContext(BuildingContext);
  if (context === undefined) {
    throw new Error('useBuilding must be used within a BuildingProvider');
  }
  return context;
};
