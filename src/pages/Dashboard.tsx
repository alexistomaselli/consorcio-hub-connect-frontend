import React, { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useClaims } from '@/context/ClaimsContext';
import StatusCard from '@/components/Dashboard/StatusCard';
import { ClaimsList } from '@/components/Dashboard/ClaimsList';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { claims } = useClaims();
  
  const buildingClaims = useMemo(() => {
    if (!currentUser?.buildingId) return [];
    return claims.filter(claim => claim.buildingId === currentUser.buildingId);
  }, [claims, currentUser]);

  // Calcular estadísticas
  const pendingCount = buildingClaims.filter(claim => claim.status === 'pending').length;
  const inProgressCount = buildingClaims.filter(claim => claim.status === 'in_progress').length;
  const resolvedCount = buildingClaims.filter(claim => claim.status === 'resolved').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-consorcio-gray-500 mt-2">
          Bienvenido, {currentUser?.firstName}. Aquí tienes un resumen de la actividad reciente.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusCard
          title="Reclamos pendientes"
          count={pendingCount}
          icon={
            <div className="text-yellow-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          }
          className="border-l-4 border-yellow-500"
        />
        
        <StatusCard
          title="En proceso"
          count={inProgressCount}
          icon={
            <div className="text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          }
          className="border-l-4 border-blue-500"
        />
        
        <StatusCard
          title="Reclamos resueltos"
          count={resolvedCount}
          icon={
            <div className="text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          }
          className="border-l-4 border-green-500"
        />
      </div>
      
      <ClaimsList claims={buildingClaims.slice(0, 5)} />
    </div>
  );
};

export default Dashboard;
