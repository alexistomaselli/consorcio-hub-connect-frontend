import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { InvitationForm } from '../components/Owners/InvitationForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { BuildingOwnership, GlobalOwner, Invitation, Unit } from '../types';

interface OwnerWithUnits extends GlobalOwner {
  ownership: BuildingOwnership;
  units: Unit[];
}

export const OwnersManagement = () => {
  const { buildingId } = useParams<{ buildingId: string }>();
  const { toast } = useToast();
  const [owners, setOwners] = useState<OwnerWithUnits[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([]);
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Cargar propietarios y unidades disponibles
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log('Cargando propietarios para el edificio:', buildingId);

        // Usar api.get en lugar de fetch para incluir automáticamente el token y la URL base
        const [ownersResponse, unitsResponse, invitationsResponse] = await Promise.all([
          api.get<OwnerWithUnits[]>(`/owners/buildings/${buildingId}`),
          api.get<Unit[]>(`/buildings/${buildingId}/units?available=true`),
          api.get<Invitation[]>(`/owners/buildings/${buildingId}/invitations`)
        ]);

        console.log('Datos de propietarios recibidos:', ownersResponse.data);

        // Asegurarnos de que los datos son arrays
        const ownersData = Array.isArray(ownersResponse.data) ? ownersResponse.data : [];
        const unitsData = Array.isArray(unitsResponse.data) ? unitsResponse.data : [];
        const invitationsData = Array.isArray(invitationsResponse.data) ? invitationsResponse.data : [];
        
        setOwners(ownersData);
        setAvailableUnits(unitsData);
        setPendingInvitations(invitationsData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos. Por favor, intente nuevamente.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (buildingId) {
      fetchData();
    }
  }, [buildingId]);

  const handleInviteOwner = async (data: Omit<Invitation, 'id' | 'buildingId' | 'status' | 'token' | 'expiresAt' | 'createdAt'>) => {
    try {
      const response = await fetch(`/owners/buildings/${buildingId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al enviar la invitación');
      }

      toast({
        title: 'Invitación enviada',
        description: 'Se ha enviado la invitación al propietario correctamente.',
      });

      setInviteDialogOpen(false);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar la invitación. Por favor, intente nuevamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Gestión de Propietarios</h1>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>Invitar Propietario</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invitar Nuevo Propietario</DialogTitle>
            </DialogHeader>
            <InvitationForm
              buildingId={buildingId}
              availableUnits={availableUnits}
              onSubmit={handleInviteOwner}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Invitaciones Pendientes */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Invitaciones Pendientes</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead>Fecha de Invitación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : pendingInvitations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    No hay invitaciones pendientes
                  </TableCell>
                </TableRow>
              ) : (
                pendingInvitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      {invitation.firstName} {invitation.lastName}
                    </TableCell>
                    <TableCell>{invitation.whatsappNumber}</TableCell>
                    <TableCell>{invitation.units[0]}</TableCell>
                    <TableCell>
                      {new Date(invitation.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pendiente
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Reenviar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Propietarios Registrados */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Propietarios Registrados</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Unidades</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : owners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    No hay propietarios registrados
                  </TableCell>
                </TableRow>
              ) : (
                owners.map((owner) => (
                  <TableRow key={owner.id}>
                    <TableCell>
                      {owner.firstName} {owner.lastName}
                    </TableCell>
                    <TableCell>
                      {owner.documentType} {owner.documentNumber}
                    </TableCell>
                    <TableCell>{owner.email}</TableCell>
                    <TableCell>
                      {owner.units.map(unit => `${unit.floor}-${unit.number}`).join(', ')}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          owner.ownership.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {owner.ownership.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
