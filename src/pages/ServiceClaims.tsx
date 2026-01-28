import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Claim, ClaimStatus } from '@/types/claim';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Loader2, Wrench } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import ClaimDetail from '@/components/Claims/ClaimDetail';
import { toast } from 'sonner';

const ServiceClaims = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

    useEffect(() => {
        fetchAssignedClaims();
    }, [currentUser]);

    const fetchAssignedClaims = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            // Assuming the user ID might be linked or we need to find the providerId first
            // For now, let's try to find claims where serviceProviderId matches currentUser.id
            // (This is a common pattern if they are the same entity in different tables)
            const { data, error } = await supabase
                .from('claims')
                .select(`
          id, title, description, status, priority, location, locationDetail,
          unitId, spaceId, creatorId, buildingId, createdAt, updatedAt, images,
          building:buildings(id, name),
          unit:units(id, number, floor),
          space:spaces(id, name),
          creator:users!creatorId(firstName, lastName, email)
        `)
                .eq('serviceProviderId', currentUser.id)
                .order('createdAt', { ascending: false });

            if (error) throw error;

            const mappedClaims = (data || []).map((item: any) => ({
                ...item,
                building: Array.isArray(item.building) ? item.building[0] : item.building,
                unit: Array.isArray(item.unit) ? item.unit[0] : item.unit,
                space: Array.isArray(item.space) ? item.space[0] : item.space,
                creator: Array.isArray(item.creator) ? item.creator[0] : item.creator,
            })) as Claim[];

            setClaims(mappedClaims);
        } catch (error) {
            console.error('Error fetching assigned claims:', error);
            toast.error('Error al cargar trabajos asignados');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: ClaimStatus) => {
        switch (status) {
            case ClaimStatus.PENDING: return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendiente</Badge>;
            case ClaimStatus.IN_PROGRESS: return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">En Progreso</Badge>;
            case ClaimStatus.RESOLVED: return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Resuelto</Badge>;
            case ClaimStatus.CANCELLED: return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelado</Badge>;
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Wrench className="h-8 w-8 text-blue-600" />
                        Trabajos Asignados
                    </h1>
                    <p className="text-muted-foreground mt-1">Gestiona los reclamos que te han sido asignados para resolución.</p>
                </div>
            </div>

            <Card>
                <TableHeader>
                    <TableRow>
                        <TableHead>Reclamo</TableHead>
                        <TableHead>Ubicación</TableHead>
                        <TableHead>Prioridad</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-48 text-center">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                            </TableCell>
                        </TableRow>
                    ) : claims.length > 0 ? (
                        claims.map((claim) => (
                            <TableRow key={claim.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => navigate(`/service-claims/${claim.id}`)}>
                                <TableCell>
                                    <p className="font-medium">{claim.title}</p>
                                    <p className="text-xs text-muted-foreground truncate max-w-xs">{claim.description}</p>
                                </TableCell>
                                <TableCell>
                                    {claim.unit ? `Unidad ${claim.unit.number}` : (claim.space?.name || 'Área Común')}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{claim.priority}</Badge>
                                </TableCell>
                                <TableCell>{getStatusBadge(claim.status)}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                No tienes trabajos asignados en este momento.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Card>

        </div>
    );
};

export default ServiceClaims;
