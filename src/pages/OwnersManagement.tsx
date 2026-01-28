import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { InvitationForm } from '../components/Owners/InvitationForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
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
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (!buildingId) return;

        // 1. Get Units and their Owners
        const { data: unitsData, error: unitsError } = await supabase
          .from('units')
          .select(`
            *,
            owner:users!units_ownerId_fkey(*)
          `)
          .eq('buildingId', buildingId);

        if (unitsError) throw unitsError;

        // 2. Get Pending Invitations
        const { data: invitesData, error: invitesError } = await supabase
          .from('platform_invitations')
          .select('*')
          .eq('buildingId', buildingId)
          .eq('status', 'PENDING');

        if (invitesError) throw invitesError;

        // Process Owners (Mocking the structure to match OwnerWithUnits as per current UI needs)
        // In a real scenario, this would involve a complex join or a specific view
        const uniqueOwnersMap = new Map<string, OwnerWithUnits>();
        unitsData?.forEach((u: any) => {
          if (u.owner) {
            const o = u.owner;
            if (!uniqueOwnersMap.has(o.id)) {
              uniqueOwnersMap.set(o.id, {
                ...o,
                ownership: { status: 'ACTIVE' }, // Default for mock
                units: [u]
              });
            } else {
              uniqueOwnersMap.get(o.id)!.units.push(u);
            }
          }
        });

        setOwners(Array.from(uniqueOwnersMap.values()));
        setAvailableUnits(unitsData?.filter((u: any) => !u.ownerId) || []);
        setPendingInvitations(invitesData || []);
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
  }, [buildingId, toast]);

  const handleInviteOwner = async (data: any) => {
    try {
      if (!buildingId) return;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      const token = crypto.randomUUID();

      const { error } = await supabase
        .from('platform_invitations')
        .insert({
          buildingId,
          email: data.email || (data as any).whatsappNumber, // Fallback if needed
          role: 'OWNER',
          firstName: data.firstName,
          lastName: data.lastName,
          token,
          expiresAt: expiresAt.toISOString(),
          status: 'PENDING',
          updatedAt: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: 'Invitación enviada',
        description: 'Se ha registrado la invitación correctamente.',
      });

      setInviteDialogOpen(false);
      // Refresh
      const { data: updatedInvites } = await supabase
        .from('platform_invitations')
        .select('*')
        .eq('buildingId', buildingId)
        .eq('status', 'PENDING');
      setPendingInvitations(updatedInvites || []);

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
              buildingId={buildingId || ''}
              availableUnits={availableUnits}
              onSubmit={async (data) => {
                await handleInviteOwner(data);
              }}
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
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Fecha de Invitación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : pendingInvitations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    No hay invitaciones pendientes
                  </TableCell>
                </TableRow>
              ) : (
                pendingInvitations.map((invitation: any) => (
                  <TableRow key={invitation.id}>
                    <TableCell>{invitation.email}</TableCell>
                    <TableCell>{invitation.role}</TableCell>
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
                      {owner.documentNumber || '-'}
                    </TableCell>
                    <TableCell>{owner.email}</TableCell>
                    <TableCell>
                      {owner.units.map(unit => `${unit.floor}-${unit.number}`).join(', ')}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${owner.ownership?.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {owner.ownership?.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
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
