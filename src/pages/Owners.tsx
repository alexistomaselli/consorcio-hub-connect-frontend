import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search, Mail, Loader2, CheckCircle2, AlertCircle, HelpCircle, UserCheck, Send, Trash2, FileSpreadsheet } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from '@/lib/supabase';
import { PlatformInvitation, InvitationRole } from '@/types';
import { useToast } from "@/components/ui/use-toast";
import { BulkInviteImporter } from '@/components/Invitations/BulkInviteImporter';

interface Unit {
  id: string;
  number: string;
  floor: string;
  ownerId?: string;
  tenantId?: string;
  owner?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    dni?: string;
    phoneNumber?: string;
  };
}

interface InviteRow {
  unitId: string;
  unitName: string;
  email: string;
  isResident: boolean;
  status: 'idle' | 'sending' | 'sent' | 'error';
}

interface ExtendedInvitation extends PlatformInvitation {
  unit?: {
    number: string;
    floor: string;
  };
}

export default function Owners() {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOwner, setSelectedOwner] = useState<Unit['owner'] | null>(null);

  const fetchData = async () => {
    if (!currentUser?.buildingId) return;

    setIsLoading(true);
    try {
      // 1. Get Units with Owners
      const { data: unitsData, error: unitsError } = await supabase
        .from('units')
        .select(`
          id, number, floor, ownerId, tenantId,
          owner:users!units_ownerId_fkey(firstName, lastName, email, dni, phoneNumber)
        `)
        .eq('buildingId', currentUser.buildingId)
        .order('number', { ascending: true });

      if (unitsError) throw unitsError;

      const formattedUnits = (unitsData || []).map((u: any) => ({
        ...u,
        owner: Array.isArray(u.owner) ? u.owner[0] : u.owner
      }));

      setUnits(formattedUnits);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser?.buildingId]);

  const filteredUnits = units.filter(u => {
    if (!u.owner) return false;
    const search = searchTerm.toLowerCase();
    return (
      u.owner.firstName?.toLowerCase().includes(search) ||
      u.owner.lastName?.toLowerCase().includes(search) ||
      u.owner.email?.toLowerCase().includes(search) ||
      u.number.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Propietarios</h1>
          <p className="text-muted-foreground">Administre los propietarios y residentes de su edificio.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Propietarios Registrados</CardTitle>
          <div className="pt-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o unidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Unidad(es)</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Cargando...</TableCell>
                </TableRow>
              ) : (filteredUnits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">No se encontraron propietarios.</TableCell>
                </TableRow>
              ) : (
                filteredUnits.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.owner?.firstName} {u.owner?.lastName}
                    </TableCell>
                    <TableCell>{u.owner?.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{u.number}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Registrado</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => setSelectedOwner(u.owner)}>
                        Ver más
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Owner Details Dialog */}
      <AlertDialog open={!!selectedOwner} onOpenChange={(open) => !open && setSelectedOwner(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Detalles del Propietario</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold block mb-1">Nombre:</span>
                  {selectedOwner?.firstName} {selectedOwner?.lastName}
                </div>
                <div>
                  <span className="font-semibold block mb-1">Email:</span>
                  {selectedOwner?.email}
                </div>
                <div>
                  <span className="font-semibold block mb-1">DNI:</span>
                  {selectedOwner?.dni || '-'}
                </div>
                <div>
                  <span className="font-semibold block mb-1">WhatsApp:</span>
                  {selectedOwner?.phoneNumber || '-'}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setSelectedOwner(null)}>Cerrar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
