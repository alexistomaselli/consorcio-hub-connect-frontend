import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Claim, ClaimStatus } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';

interface ClaimsListProps {
  claims: Claim[];
}

const getStatusColor = (status: ClaimStatus) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500';
    case 'in_progress':
      return 'bg-blue-500';
    case 'resolved':
      return 'bg-green-500';
    case 'cancelled':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
};

export function ClaimsList({ claims }: ClaimsListProps) {
  const [filter, setFilter] = useState<ClaimStatus | 'all'>('all');
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'BUILDING_ADMIN' || currentUser?.role === 'SUPER_ADMIN';

  const filteredClaims = claims.filter(claim => 
    filter === 'all' ? true : claim.status === filter
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Badge 
          onClick={() => setFilter('all')}
          className={`cursor-pointer ${filter === 'all' ? 'bg-primary' : 'bg-secondary'}`}
        >
          Todos
        </Badge>
        <Badge 
          onClick={() => setFilter('pending')}
          className={`cursor-pointer ${filter === 'pending' ? 'bg-yellow-500' : 'bg-secondary'}`}
        >
          Pendientes
        </Badge>
        <Badge 
          onClick={() => setFilter('in_progress')}
          className={`cursor-pointer ${filter === 'in_progress' ? 'bg-blue-500' : 'bg-secondary'}`}
        >
          En Progreso
        </Badge>
        <Badge 
          onClick={() => setFilter('resolved')}
          className={`cursor-pointer ${filter === 'resolved' ? 'bg-green-500' : 'bg-secondary'}`}
        >
          Resueltos
        </Badge>
        <Badge 
          onClick={() => setFilter('cancelled')}
          className={`cursor-pointer ${filter === 'cancelled' ? 'bg-gray-500' : 'bg-secondary'}`}
        >
          Cancelados
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClaims.map(claim => (
          <Card key={claim.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold">{claim.title}</CardTitle>
                <Badge className={getStatusColor(claim.status)}>
                  {claim.status === 'in_progress' ? 'En Progreso' : 
                   claim.status === 'pending' ? 'Pendiente' :
                   claim.status === 'resolved' ? 'Resuelto' : 'Cancelado'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 line-clamp-2">{claim.description}</p>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>
                      {format(new Date(claim.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                    </span>
                    <Badge className={`bg-${claim.category === 'plumbing' ? 'blue' : 
                                       claim.category === 'electrical' ? 'yellow' :
                                       claim.category === 'elevator' ? 'purple' :
                                       'gray'}-500`}>
                      {claim.category === 'plumbing' ? 'Plomería' :
                       claim.category === 'electrical' ? 'Electricidad' :
                       claim.category === 'elevator' ? 'Ascensor' :
                       claim.category === 'general' ? 'General' : 'Otro'}
                    </Badge>
                  </div>
                  
                  {/* Mostrar información del creador solo para administradores */}
                  {isAdmin && claim.creator && (
                    <div className="flex items-center justify-end">
                      <Badge variant="outline" className="bg-gray-100 text-gray-700 flex items-center gap-1">
                        <span className="text-xs">Creado por:</span>
                        <span className="font-semibold">{claim.creator.firstName} {claim.creator.lastName}</span>
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
