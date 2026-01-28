import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Claim, ClaimStatus, ClaimLocation, ClaimPriority } from '@/types/claim';
import { Building } from '@/types/building';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PlusCircle, Search, Loader2, ChevronDown, ChevronUp, Eye, RefreshCw, Pencil, Trash2, LayoutDashboard, List, Building as BuildingIcon } from 'lucide-react';
import { toast } from 'sonner';
import { CreateClaimForm } from '@/components/Claims/CreateClaimForm';
import { ClaimsKanban } from '@/components/Claims/ClaimsKanban';
import ClaimDetail from '@/components/Claims/ClaimDetail';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MyClaimsPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [claims, setClaims] = useState<Claim[]>([]);
  // We'll separate claims into two Lists: Created by me vs From my units (but not created by me)
  const [myClaims, setMyClaims] = useState<Claim[]>([]);
  const [unitClaims, setUnitClaims] = useState<Claim[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all');
  const [locationFilter, setLocationFilter] = useState<ClaimLocation | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  // Estado para el reclamo seleccionado para ver detalles
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  // Estado para el reclamo que se está editando
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null);
  const [claimToDelete, setClaimToDelete] = useState<string | null>(null);

  // Estado para controlar las filas expandidas en la tabla
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Verificamos que el usuario sea un propietario o residente
  useEffect(() => {
    if (currentUser?.role !== 'OWNER' && currentUser?.role !== 'RESIDENT') {
      navigate('/dashboard');
      toast.error('No tienes permisos para acceder a esta página');
    }
  }, [currentUser, navigate]);

  // Cargar reclamos al iniciar
  useEffect(() => {
    fetchMyClaims();
  }, [currentUser]);

  // Filtro de reclamos cuando cambian los filtros (solo para searched/filtered lists si quisieramos optimizar, pero aqui filtramos en render o helper)
  // Actually, let's keep it simple: fetch divides data, render logic filters it.

  const fetchMyClaims = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      console.log('Obteniendo mis reclamos (Supabase)...');

      // 1. Obtener reclamos donde soy el creador (creatorId)
      const { data: createdClaimsData, error: errorCreated } = await supabase
        .from('claims')
        .select(`
          id, title, description, status, priority, location, locationDetail, 
          unitId, spaceId, creatorId, buildingId, createdAt, updatedAt, images,
          building:buildings(id, name),
          unit:units(id, number, floor),
          space:spaces(id, name),
          creator:users!creatorId(firstName, lastName, email)
        `)
        .eq('creatorId', currentUser.id)
        .order('createdAt', { ascending: false });

      if (errorCreated) throw errorCreated;

      // 2. Obtener reclamos de mis unidades (donde soy ownerId o tenantId en la unidad)
      // Primero buscamos mis unidades
      const { data: myUnits, error: errorUnits } = await supabase
        .from('units')
        .select('id')
        .or(`ownerId.eq.${currentUser.id},tenantId.eq.${currentUser.id}`);

      let unitClaimsData: any[] = [];
      if (!errorUnits && myUnits && myUnits.length > 0) {
        const unitIds = myUnits.map(u => u.id);
        const { data: claimsFromUnits, error: errorUnitClaims } = await supabase
          .from('claims')
          .select(`
            id, title, description, status, priority, location, locationDetail, 
            unitId, spaceId, creatorId, buildingId, createdAt, updatedAt, images,
            building:buildings(id, name),
            unit:units(id, number, floor),
            space:spaces(id, name),
            creator:users!creatorId(firstName, lastName, email)
          `)
          .in('unitId', unitIds) // Reclamos asociados a mis unidades
          .neq('creatorId', currentUser.id) // Evitar duplicados si yo lo cree (ya esta en createdClaims)
          .order('createdAt', { ascending: false });

        if (!errorUnitClaims && claimsFromUnits) {
          unitClaimsData = claimsFromUnits;
        }
      }

      // Mapper helper
      const mapClaim = (item: any): Claim => ({
        id: item.id,
        title: item.title,
        description: item.description,
        status: item.status,
        priority: item.priority || undefined,
        category: item.category,
        location: item.location,
        locationDetail: item.locationDetail,
        buildingId: item.buildingId,
        unitId: item.unitId,
        spaceId: item.spaceId,
        creatorId: item.creatorId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        building: item.building,
        unit: item.unit,
        space: item.space,
        creator: item.creator ? {
          id: item.creatorId,
          firstName: item.creator.firstName,
          lastName: item.creator.lastName,
          email: item.creator.email
        } : undefined,
        unitNumber: item.unit ? `${item.unit.floor || ''}-${item.unit.number || ''}` : undefined,
        images: item.images || [],
        comments: item.comments || []
      });

      const mappedCreatedClaims = (createdClaimsData || []).map(mapClaim);
      const mappedUnitClaims = unitClaimsData.map(mapClaim);
      const allClaims = [...mappedCreatedClaims, ...mappedUnitClaims];

      // Sort all by date
      mappedCreatedClaims.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      mappedUnitClaims.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      allClaims.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setMyClaims(mappedCreatedClaims);
      setUnitClaims(mappedUnitClaims);
      setClaims(allClaims); // For "All" or Kanban view combined

    } catch (error: any) {
      console.error('Error al obtener mis reclamos:', error);
      const errorMessage = error.message || 'Error desconocido';
      toast.error(`Error al cargar reclamos: ${errorMessage}`);
      setClaims([]);
      setMyClaims([]);
      setUnitClaims([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to filter a list of claims
  const getFilteredList = (list: Claim[]) => {
    return list.filter(claim => {
      const matchesTerm = searchTerm === '' ||
        claim.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
      const matchesLocation = locationFilter === 'all' || claim.location === locationFilter;

      return matchesTerm && matchesStatus && matchesLocation;
    });
  };

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.PENDING:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendiente</Badge>;
      case ClaimStatus.IN_PROGRESS:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">En Progreso</Badge>;
      case ClaimStatus.RESOLVED:
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Resuelto</Badge>;
      case ClaimStatus.CANCELLED:
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const deleteClaim = async (claimId: string) => {
    try {
      const { error } = await supabase
        .from('claims')
        .delete()
        .eq('id', claimId);

      if (error) throw error;

      toast.success('Reclamo eliminado correctamente');
      fetchMyClaims();
    } catch (error) {
      console.error('Error al eliminar reclamo:', error);
      toast.error('Error al eliminar el reclamo');
    } finally {
      setDeleteDialogOpen(false);
      setClaimToDelete(null);
    }
  };

  const updateClaimStatus = async (claimId: string, newStatus: ClaimStatus) => {
    try {
      const { error } = await supabase
        .from('claims')
        .update({ status: newStatus })
        .eq('id', claimId);

      if (error) throw error;

      toast.success(`Estado del reclamo actualizado a ${newStatus} `);
      fetchMyClaims();
    } catch (error) {
      console.error('Error al actualizar estado del reclamo:', error);
      toast.error('Error al actualizar el estado del reclamo');
    }
  };

  // Función para actualizar un reclamo
  const updateClaim = async (id: string, data: Partial<Claim>) => {
    try {
      // Mapear camelCase a snake_case para la DB
      const dbData: any = {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.status && { status: data.status }),
        ...(data.priority && { priority: data.priority }),
      };

      const { error } = await supabase
        .from('claims')
        .update(dbData)
        .eq('id', id);

      if (error) throw error;

      toast.success("Reclamo actualizado correctamente");
      fetchMyClaims();
      setEditingClaim(null);
    } catch (error) {
      console.error("Error al actualizar el reclamo:", error);
      toast.error("Error al actualizar el reclamo");
    }
  };

  // Shared Table Component
  const ClaimsTable = ({ data, showCreator = false }: { data: Claim[], showCreator?: boolean }) => (
    <Card className="border-none shadow-none overflow-x-auto">
      <Table className="min-w-[800px] md:min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Reclamo</TableHead>
            {showCreator && <TableHead>Creado Por</TableHead>}
            <TableHead>Ubicación</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Prioridad</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={showCreator ? 7 : 6} className="h-48 text-center">
                <div className="flex justify-center items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              </TableCell>
            </TableRow>
          ) : data.length > 0 ? (
            data.map((claim) => (
              <TableRow
                key={claim.id}
                className="hover:bg-muted/50"
                onClick={() => navigate(`/my-claims/${claim.id}`)}
              >
                <TableCell>
                  <Collapsible
                    open={expandedRows[claim.id] || false}
                    onOpenChange={(open) => {
                      setExpandedRows(prev => ({
                        ...prev,
                        [claim.id]: open
                      }));
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <CollapsibleTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <div className="mt-1 cursor-pointer hover:bg-slate-100 rounded p-0.5">
                          {expandedRows[claim.id] ?
                            <ChevronUp className="h-4 w-4 text-gray-500" /> :
                            <ChevronDown className="h-4 w-4 text-gray-500" />}
                        </div>
                      </CollapsibleTrigger>
                      <div>
                        <p className="font-medium cursor-pointer hover:underline decoration-slate-400/50">{claim.title}</p>
                        {!expandedRows[claim.id] && (
                          <p className="text-sm text-muted-foreground truncate max-w-xs">{claim.description}</p>
                        )}
                      </div>
                    </div>
                    <CollapsibleContent>
                      <div className="pl-6 pt-2 text-sm">
                        <div className="p-3 bg-muted/50 rounded-md text-slate-700">
                          {claim.description}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </TableCell>
                {showCreator && (
                  <TableCell>
                    {claim.creator ? `${claim.creator.firstName} ${claim.creator.lastName}` : 'Yo'}
                  </TableCell>
                )}
                <TableCell>
                  {claim.location === ClaimLocation.UNIT && claim.unit ?
                    `Unidad ${claim.unit.floor || ''}-${claim.unit.number}` :
                    claim.location === ClaimLocation.COMMON_AREA && claim.space ?
                      claim.space.name :
                      claim.locationDetail || 'Edificio'}
                </TableCell>
                <TableCell>{formatDate(claim.createdAt)}</TableCell>
                <TableCell>
                  {claim.priority === ClaimPriority.HIGH && <Badge className="bg-red-500 hover:bg-red-600">Alta</Badge>}
                  {claim.priority === ClaimPriority.URGENT && <Badge className="bg-red-600 hover:bg-red-700 font-bold">Urgente</Badge>}
                  {claim.priority === ClaimPriority.NORMAL && <Badge className="bg-orange-500 hover:bg-orange-600">Normal</Badge>}
                  {claim.priority === ClaimPriority.LOW && <Badge className="bg-blue-500 hover:bg-blue-600">Baja</Badge>}
                  {!claim.priority && <span className="text-muted-foreground">-</span>}
                </TableCell>
                <TableCell>{getStatusBadge(claim.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1" onClick={(e) => e.stopPropagation()}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => navigate(`/my-claims/${claim.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ver detalles</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* Solo mostrar acciones de edición/borrado si soy el creador */}
                    {claim.creatorId === currentUser?.id && (
                      <>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setEditingClaim({
                                    ...claim,
                                    buildingId: claim.buildingId || claim.building?.id
                                  });
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar reclamo</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <AlertDialog open={deleteDialogOpen && claimToDelete === claim.id} onOpenChange={setDeleteDialogOpen}>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => {
                                setClaimToDelete(claim.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar reclamo?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción es permanente y no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setClaimToDelete(null)}>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => claimToDelete && deleteClaim(claimToDelete)}
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={showCreator ? 7 : 6} className="h-32 text-center text-muted-foreground">
                <div className="flex flex-col items-center justify-center p-4">
                  <div className="bg-slate-50 p-3 rounded-full mb-3">
                    <List className="h-6 w-6 text-slate-300" />
                  </div>
                  <p>No se encontraron reclamos en esta sección</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Empresa de Servicios</h1>
          <p className="text-muted-foreground mt-1">Gestiona y supervisa los reclamos de tu unidad y edificio.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-sm">
              <PlusCircle className="h-5 w-5" />
              Nuevo Reclamo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Reclamo</DialogTitle>
              <DialogDescription>
                Completa la información para registrar un nuevo reclamo.
              </DialogDescription>
            </DialogHeader>
            <CreateClaimForm onSuccess={() => {
              setIsOpen(false);
              fetchMyClaims();
              toast.success('Reclamo creado exitosamente');
            }} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="my-claims" className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="w-full overflow-x-auto pb-1 scrollbar-none">
            <TabsList className="inline-flex w-full md:w-auto h-auto justify-start bg-muted/50 p-1 min-w-max">
              <TabsTrigger value="my-claims" className="gap-2 px-4 py-2">
                <List className="h-4 w-4" /> Mis Reclamos
              </TabsTrigger>
              <TabsTrigger value="unit-claims" className="gap-2 px-4 py-2">
                <BuildingIcon className="h-4 w-4" /> Reclamos de Unidades
              </TabsTrigger>
              <TabsTrigger value="kanban" className="gap-2 px-4 py-2">
                <LayoutDashboard className="h-4 w-4" /> Tablero
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Global Filters */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 scrollbar-none">
            <div className="relative w-full md:w-64 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white h-9"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value: ClaimStatus | 'all') => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[140px] bg-white h-9">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value={ClaimStatus.PENDING}>Pendiente</SelectItem>
                <SelectItem value={ClaimStatus.IN_PROGRESS}>En Progreso</SelectItem>
                <SelectItem value={ClaimStatus.RESOLVED}>Resuelto</SelectItem>
                <SelectItem value={ClaimStatus.CANCELLED}>Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="my-claims" className="mt-0">
          <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
            <ClaimsTable data={getFilteredList(myClaims)} />
          </Card>
        </TabsContent>

        <TabsContent value="unit-claims" className="mt-0">
          <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
            <div className="p-4 bg-muted/30 border-b border-slate-100 mb-0">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <BuildingIcon className="w-4 h-4" />
                Estos son reclamos creados por otros usuarios (ej. inquilinos) asociados a tus unidades.
              </p>
            </div>
            <ClaimsTable data={getFilteredList(unitClaims)} showCreator={true} />
          </Card>
        </TabsContent>

        <TabsContent value="kanban" className="mt-0">
          <ClaimsKanban
            claims={getFilteredList(claims)}
            onClaimClick={(claim) => navigate(`/my-claims/${claim.id}`)}
          />
        </TabsContent>
      </Tabs>

      {/* Modal de edición de reclamo */}
      <Dialog open={!!editingClaim} onOpenChange={(open) => !open && setEditingClaim(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Reclamo</DialogTitle>
            <DialogDescription>
              Edita los detalles del reclamo seleccionado.
            </DialogDescription>
          </DialogHeader>
          {editingClaim && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Título
                </Label>
                <Input
                  id="title"
                  className="col-span-3"
                  defaultValue={editingClaim.title}
                  onChange={(e) => setEditingClaim({ ...editingClaim, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  className="col-span-3"
                  defaultValue={editingClaim.description}
                  onChange={(e) => setEditingClaim({ ...editingClaim, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Estado
                </Label>
                <Select
                  defaultValue={editingClaim.status}
                  onValueChange={(value: ClaimStatus) => setEditingClaim({ ...editingClaim, status: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ClaimStatus.PENDING}>Pendiente</SelectItem>
                    <SelectItem value={ClaimStatus.IN_PROGRESS}>En Progreso</SelectItem>
                    <SelectItem value={ClaimStatus.RESOLVED}>Resuelto</SelectItem>
                    <SelectItem value={ClaimStatus.CANCELLED}>Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingClaim(null)}>Cancelar</Button>
            <Button onClick={() => updateClaim(editingClaim!.id, {
              title: editingClaim!.title,
              description: editingClaim!.description,
              status: editingClaim!.status
            })}>Guardar cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default MyClaimsPage;
