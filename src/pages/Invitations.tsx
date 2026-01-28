import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Mail, Loader2, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { InvitationRole, PlatformInvitation } from '@/types';
import { useToast } from "@/components/ui/use-toast";
import { CreateInvitationDialog } from '@/components/Invitations/CreateInvitationDialog';
import { BulkInviteImporter } from '@/components/Invitations/BulkInviteImporter';
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ExtendedInvitation extends PlatformInvitation {
    unit?: {
        number: string;
        floor: string;
    };
}

export default function Invitations() {
    const { currentUser } = useAuth();
    const { toast } = useToast();
    const [invitations, setInvitations] = useState<ExtendedInvitation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [invitationToDelete, setInvitationToDelete] = useState<string | null>(null);
    const [showBulkImport, setShowBulkImport] = useState(false);
    const [unitsMap, setUnitsMap] = useState<Record<string, string>>({});
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    // Helper for props that need isResident to be strict boolean
    const strictInvitations = invitations.map(inv => ({
        unitId: inv.unitId || '',
        role: inv.role,
        isResident: !!inv.isResident
    }));

    const fetchInvitations = async () => {
        if (!currentUser?.buildingId) return;

        setIsLoading(true);
        try {
            // Fetch Invitations
            const { data: invitesData, error: invitesError } = await supabase
                .from('platform_invitations')
                .select(`
          *,
          unit:units(number, floor)
        `)
                .eq('buildingId', currentUser.buildingId)
                .order('createdAt', { ascending: false });

            if (invitesError) throw invitesError;
            setInvitations(invitesData as ExtendedInvitation[] || []);

            // Fetch Units for Mapping (only needed for bulk import but good to have)
            const { data: unitsData, error: unitsError } = await supabase
                .from('units')
                .select('id, number')
                .eq('buildingId', currentUser.buildingId);

            if (unitsError) throw unitsError;

            const map: Record<string, string> = {};
            unitsData?.forEach((u: any) => {
                map[u.number] = u.id;
            });
            setUnitsMap(map);

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
        fetchInvitations();
    }, [currentUser?.buildingId]);

    const confirmDeleteInvitation = async () => {
        if (!invitationToDelete) return;

        try {
            const { error } = await supabase
                .from('platform_invitations')
                .delete()
                .eq('id', invitationToDelete);

            if (error) throw error;

            toast({
                title: 'Invitación eliminada',
                description: 'La invitación ha sido cancelada correctamente.',
            });
            fetchInvitations();
        } catch (error) {
            console.error('Error deleting invitation:', error);
            toast({
                title: 'Error',
                description: 'No se pudo eliminar la invitación.',
                variant: 'destructive',
            });
        } finally {
            setInvitationToDelete(null);
        }
    };

    const getRoleLabel = (inv: ExtendedInvitation) => {
        if (inv.role === InvitationRole.OWNER) {
            return inv.isResident ? 'Propietario y Residente' : 'Propietario';
        }
        return 'Residente'; // UserRole.RESIDENT
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Pendiente</Badge>;
            case 'ACCEPTED':
                return <Badge className="bg-green-600 hover:bg-green-700">Aceptada</Badge>;
            case 'EXPIRED':
                return <Badge variant="destructive">Expirada</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const filteredInvitations = invitations.filter(inv => {
        if (statusFilter === 'ALL') return true;
        return inv.status === statusFilter;
    });

    return (
        <div className="space-y-6 pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Invitaciones</h1>
                    <p className="text-muted-foreground">Administre las invitaciones enviadas a propietarios y residentes.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowBulkImport(true)}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Importar Excel
                    </Button>
                    <Button variant="outline" size="icon" onClick={fetchInvitations}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <CreateInvitationDialog
                        buildingId={currentUser?.buildingId || ''}
                        existingInvitations={strictInvitations}
                        onSuccess={fetchInvitations}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Historial de Invitaciones</CardTitle>
                            <CardDescription>
                                Lista de todas las invitaciones enviadas y su estado actual.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Filtrar por:</span>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Todos</SelectItem>
                                    <SelectItem value="PENDING">Pendientes</SelectItem>
                                    <SelectItem value="ACCEPTED">Aceptadas</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                            <p className="mt-2 text-muted-foreground">Cargando invitaciones...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Unidad</TableHead>
                                    <TableHead>Rol Asignado</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Enviado el</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInvitations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            {invitations.length === 0
                                                ? "No hay invitaciones registradas."
                                                : "No se encontraron invitaciones con este filtro."}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredInvitations.map(inv => (
                                        <TableRow key={inv.id}>
                                            <TableCell className="font-medium">{inv.email}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono">
                                                    {inv.unit?.number || 'N/A'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-slate-50">
                                                    {getRoleLabel(inv)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(inv.status)}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {format(new Date(inv.createdAt), "d MMM yyyy", { locale: es })}
                                            </TableCell>
                                            <TableCell>
                                                {inv.status === 'PENDING' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => setInvitationToDelete(inv.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={showBulkImport} onOpenChange={setShowBulkImport}>
                <DialogContent className="max-w-4xl">
                    <BulkInviteImporter
                        buildingId={currentUser?.buildingId || ''}
                        unitsMap={unitsMap}
                        existingInvitations={strictInvitations}
                        onSuccess={() => {
                            setShowBulkImport(false);
                            fetchInvitations();
                        }}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!invitationToDelete} onOpenChange={(open) => !open && setInvitationToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar invitación?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará permanentemente la invitación y el enlace de registro dejará de funcionar.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteInvitation} className="bg-red-600 hover:bg-red-700">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
