import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UserPlus, Search } from 'lucide-react';
import { InviteOwnerModal } from '@/components/Owners/InviteOwnerModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  ownedBuildings: Array<{
    unitNumber: string;
    isVerified: boolean;
  }>;
}

interface PendingInvitation {
  id: string;
  firstName: string;
  lastName: string;
  whatsappNumber: string;
  unitNumber: string;
  expiresAt: string;
}

export default function Owners() {
  const { user } = useAuth();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    if (user?.buildingId) {
      Promise.all([
        // Obtener propietarios registrados
        fetch(`http://localhost:3000/owners/buildings/${user.buildingId}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        }).then(res => res.json()),
        // Obtener invitaciones pendientes
        fetch(`http://localhost:3000/owners/buildings/${user.buildingId}/invitations`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        }).then(res => res.json())
      ])
      .then(([ownersData, invitationsData]) => {
        setOwners(ownersData);
        setInvitations(invitationsData);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      });
    }
  }, [user]);

  const filteredOwners = owners.filter(owner => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      owner.firstName.toLowerCase().includes(searchTermLower) ||
      owner.lastName.toLowerCase().includes(searchTermLower) ||
      owner.email.toLowerCase().includes(searchTermLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Propietarios</h1>
        <Button onClick={() => setShowInviteModal(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invitar Propietario
        </Button>
      </div>

      {invitations.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Invitaciones Pendientes</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead>Expira</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell>
                    {invitation.firstName} {invitation.lastName}
                  </TableCell>
                  <TableCell>{invitation.whatsappNumber}</TableCell>
                  <TableCell>{invitation.unitNumber}</TableCell>
                  <TableCell>
                    {new Date(invitation.expiresAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar propietarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Propietarios Registrados</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Unidades</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Cargando propietarios...
                </TableCell>
              </TableRow>
            ) : filteredOwners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No hay propietarios registrados
                </TableCell>
              </TableRow>
            ) : (
              filteredOwners.map((owner) => (
                <TableRow key={owner.id}>
                  <TableCell>
                    {owner.firstName} {owner.lastName}
                  </TableCell>
                  <TableCell>{owner.email}</TableCell>
                  <TableCell>
                    {owner.whatsappNumber || owner.phoneNumber || '-'}
                  </TableCell>
                  <TableCell>
                    {owner.ownedBuildings.map(b => b.unitNumber).join(', ')}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${owner.ownedBuildings.every(b => b.isVerified) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                    >
                      {owner.ownedBuildings.every(b => b.isVerified) ? 'Verificado' : 'Pendiente'}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <InviteOwnerModal
        buildingId={user?.buildingId || ''}
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={() => {
          setShowInviteModal(false);
          // Recargar invitaciones
          if (user?.buildingId) {
            fetch(`http://localhost:3000/owners/buildings/${user.buildingId}/invitations`, {
              headers: {
                'Authorization': `Bearer ${user.token}`
              }
            })
              .then(res => res.json())
              .then(data => setInvitations(data));
          }
        }}
      />
    </div>
  );
}
