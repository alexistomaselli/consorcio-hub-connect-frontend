import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Claim, ClaimStatus, ClaimLocation, ClaimPriority } from '@/types/claim';
import { api } from '@/lib/api';
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
import { PlusCircle, Search, Loader2, ChevronDown, ChevronUp, Eye, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { CreateClaimForm } from '@/components/Claims/CreateClaimForm';
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

const MyClaimsPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
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
  
  // Estados para manejar los edificios del propietario
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [loadingBuildings, setLoadingBuildings] = useState(true);
  
  // Verificamos que el usuario sea un propietario
  useEffect(() => {
    if (currentUser?.role !== 'OWNER') {
      navigate('/dashboard');
      toast.error('No tienes permisos para acceder a esta página');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    fetchOwnerBuildings();
  }, [currentUser]);
  
  // Seleccionar automáticamente el primer edificio cuando se carguen los edificios
  useEffect(() => {
    if (buildings.length > 0 && !selectedBuildingId) {
      setSelectedBuildingId(buildings[0].id);
    }
  }, [buildings]);
  
  // Cargar reclamos cuando cambie el edificio seleccionado
  useEffect(() => {
    if (selectedBuildingId) {
      fetchMyClaims();
    }
  }, [selectedBuildingId]);

  // Filtro de reclamos cuando cambian los filtros
  useEffect(() => {
    filterClaims();
  }, [claims, searchTerm, statusFilter, locationFilter]);

  // Obtener los edificios del propietario
  const fetchOwnerBuildings = async () => {
    setLoadingBuildings(true);
    
    try {
      console.log('Obteniendo edificios del propietario...');
      
      const response = await api.get<Building[]>('/owners/me/buildings', {
        timeout: 5000
      });
      
      console.log('Edificios del propietario:', response.data);
      
      const ownerBuildings = Array.isArray(response.data) ? response.data : [];
      setBuildings(ownerBuildings);
      
      // Si solo hay un edificio, lo seleccionamos automáticamente
      if (ownerBuildings.length === 1) {
        setSelectedBuildingId(ownerBuildings[0].id);
      } else if (ownerBuildings.length > 1) {
        // Si hay múltiples edificios, mostramos un mensaje para que seleccione uno
        toast.info('Por favor, selecciona un edificio para ver tus reclamos');
      }
    } catch (error: any) {
      console.error('Error al obtener edificios:', error?.response?.status || error?.message || error);
      toast.error('No se pudieron cargar los edificios. Por favor intenta más tarde.');
      setBuildings([]);
    } finally {
      setLoadingBuildings(false);
    }
  };
  
  const fetchMyClaims = async () => {
    setLoading(true);
    
    try {
      console.log('Obteniendo mis reclamos...');
      
      // Si no hay edificio seleccionado y hay múltiples edificios, no cargamos reclamos
      if (!selectedBuildingId && buildings.length > 1) {
        setClaims([]);
        setFilteredClaims([]);
        setLoading(false);
        return;
      }
      
      // Usamos el edificio seleccionado, o el único disponible si solo hay uno
      const buildingId = selectedBuildingId || (buildings.length === 1 ? buildings[0].id : '');
      
      // Verificar que tengamos un buildingId válido
      if (!buildingId) {
        console.warn('No hay un edificio seleccionado válido');
        setClaims([]);
        setFilteredClaims([]);
        setLoading(false);
        return;
      }
      
      console.log(`Obteniendo reclamos del edificio ${buildingId}...`);
      
      // Intentamos primero con el endpoint específico para 'my-claims'
      try {
        const response = await api.get<Claim[]>(`/buildings/${buildingId}/claims/my-claims`);
        console.log('Respuesta de la API (my-claims):', response.data);
        
        const myClaims = Array.isArray(response.data) ? response.data : [];
        setClaims(myClaims);
        setFilteredClaims(myClaims);
      } catch (myClaimsError) {
        console.warn('Error al usar endpoint my-claims, intentando alternativa:', myClaimsError);
        
        // Si falla, intentamos con el endpoint general de claims, filtrando en el cliente
        const response = await api.get<Claim[]>(`/buildings/${buildingId}/claims`);
        console.log('Respuesta de la API (claims generales):', response.data);
        
        // Filtramos solo los reclamos creados por el usuario actual
        const allClaims = Array.isArray(response.data) ? response.data : [];
        const userClaims = allClaims.filter(claim => 
          claim.creatorId === currentUser?.id || 
          (claim.creator && claim.creator.id === currentUser?.id)
        );
        
        console.log(`Reclamos filtrados para usuario ${currentUser?.id}:`, userClaims);
        setClaims(userClaims);
        setFilteredClaims(userClaims);
      }
    } catch (error: any) {
      console.error('Error al obtener mis reclamos:', error?.response?.status || error?.message || error);
      toast.error('No se pudieron cargar tus reclamos. Por favor intenta más tarde.');
      // Establecemos arrays vacíos para evitar que siga cargando indefinidamente
      setClaims([]);
      setFilteredClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const filterClaims = () => {
    let filtered = [...claims];
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(claim => 
        claim.title.toLowerCase().includes(term) || 
        claim.description.toLowerCase().includes(term)
      );
    }
    
    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(claim => claim.status === statusFilter);
    }
    
    // Filtrar por ubicación
    if (locationFilter !== 'all') {
      filtered = filtered.filter(claim => claim.location === locationFilter);
    }
    
    setFilteredClaims(filtered);
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

  const getLocationLabel = (location: ClaimLocation) => {
    switch (location) {
      case ClaimLocation.UNIT: return 'Unidad';
      case ClaimLocation.COMMON_AREA: return 'Área Común';
      case ClaimLocation.BUILDING: return 'Edificio';
      default: return 'Desconocido';
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
    if (!selectedBuildingId) {
      toast.error('No hay edificio seleccionado');
      return;
    }
    
    try {
      const response = await api.delete(`/buildings/${selectedBuildingId}/claims/${claimId}`);
      
      if (response.status === 200) {
        toast.success('Reclamo eliminado correctamente');
        // Actualizar la lista de reclamos
        fetchMyClaims();
      }
    } catch (error) {
      console.error('Error al eliminar reclamo:', error);
      toast.error('Error al eliminar el reclamo');
    } finally {
      setDeleteDialogOpen(false);
      setClaimToDelete(null);
    }
  };

  const updateClaimStatus = async (claimId: string, newStatus: ClaimStatus) => {
    if (!selectedBuildingId) {
      toast.error('No hay edificio seleccionado');
      return;
    }
    
    try {
      // Usar el mismo endpoint que en la vista Claims
      const response = await api.patch(`/buildings/${selectedBuildingId}/claims/${claimId}`, {
        status: newStatus
      });
      
      if (response.status === 200) {
        toast.success(`Estado del reclamo actualizado a ${newStatus}`);
        // Actualizar la lista de reclamos
        fetchMyClaims();
      }
    } catch (error) {
      console.error('Error al actualizar estado del reclamo:', error);
      toast.error('Error al actualizar el estado del reclamo');
    }
  };
  
  // Función para actualizar un reclamo
  const updateClaim = async (id: string, data: Partial<Claim>) => {
    if (!editingClaim || !editingClaim.buildingId) {
      toast.error('No se puede identificar el edificio para este reclamo');
      return;
    }
    
    try {
      // Usar el buildingId guardado en el reclamo que se está editando
      await api.patch(`/buildings/${editingClaim.buildingId}/claims/${id}`, data);
      toast.success("Reclamo actualizado correctamente");
      
      // Actualizar la lista de reclamos
      fetchMyClaims();
      setEditingClaim(null);
    } catch (error) {
      console.error("Error al actualizar el reclamo:", error);
      toast.error("Error al actualizar el reclamo");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Mis Reclamos</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
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
      
      {/* Selector de edificios */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">Selecciona un Edificio</h2>
          <div className="flex items-center gap-3">
            {loadingBuildings ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Cargando edificios...</span>
              </div>
            ) : buildings.length > 0 ? (
              <Select
                value={selectedBuildingId}
                onValueChange={(value: string) => setSelectedBuildingId(value)}
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Selecciona un edificio" />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((building) => (
                    <SelectItem key={building.id} value={building.id}>
                      {building.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-muted-foreground">No se encontraron edificios asociados a tu cuenta.</p>
            )}
          </div>
        </div>
      </Card>  
      <div className="mb-6 flex flex-wrap gap-3 items-end">
        <div className="grow">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar reclamos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <div className="flex gap-3 flex-wrap">
          <Select 
            value={statusFilter} 
            onValueChange={(value: ClaimStatus | 'all') => setStatusFilter(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value={ClaimStatus.PENDING}>Pendiente</SelectItem>
              <SelectItem value={ClaimStatus.IN_PROGRESS}>En Progreso</SelectItem>
              <SelectItem value={ClaimStatus.RESOLVED}>Resuelto</SelectItem>
              <SelectItem value={ClaimStatus.CANCELLED}>Cancelado</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={locationFilter} 
            onValueChange={(value: ClaimLocation | 'all') => setLocationFilter(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Ubicación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las ubicaciones</SelectItem>
              <SelectItem value={ClaimLocation.UNIT}>Unidad</SelectItem>
              <SelectItem value={ClaimLocation.COMMON_AREA}>Área Común</SelectItem>
              <SelectItem value={ClaimLocation.BUILDING}>Edificio</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Listado de Mis Reclamos</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Reclamo</TableHead>
              <TableHead>Unidad/Espacio</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading || loadingBuildings ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Cargando...
                  </div>
                </TableCell>
              </TableRow>
            ) : buildings.length > 1 && !selectedBuildingId ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Por favor selecciona un edificio para ver tus reclamos
                </TableCell>
              </TableRow>
            ) : filteredClaims.length > 0 ? (
              filteredClaims.map((claim) => (
                <TableRow 
                  key={claim.id}
                  className="hover:bg-muted/50"
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
                        <CollapsibleTrigger asChild>
                          <div className="mt-1 cursor-pointer">
                            {expandedRows[claim.id] ? 
                              <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                              <ChevronDown className="h-4 w-4 text-gray-500" />}
                          </div>
                        </CollapsibleTrigger>
                        <div>
                          <p className="font-medium">{claim.title}</p>
                          {!expandedRows[claim.id] && (
                            <p className="text-sm text-muted-foreground truncate max-w-xs">{claim.description}</p>
                          )}
                        </div>
                      </div>
                      <CollapsibleContent>
                        <div className="pl-6 pt-2 text-sm">
                          <div className="p-3 bg-muted/50 rounded-md">
                            {claim.description}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </TableCell>
                  <TableCell>
                    {claim.location === ClaimLocation.UNIT && claim.unit ? 
                      `${claim.unit.floor}-${claim.unit.number}` : 
                      claim.location === ClaimLocation.COMMON_AREA && claim.space ?
                      claim.space.name : 
                      '-'}
                  </TableCell>
                  <TableCell>{formatDate(claim.createdAt)}</TableCell>
                  <TableCell>
                    {claim.priority === ClaimPriority.HIGH && <Badge className="bg-red-500">Alta</Badge>}
                    {claim.priority === ClaimPriority.URGENT && <Badge className="bg-red-600 font-bold">Urgente</Badge>}
                    {claim.priority === ClaimPriority.NORMAL && <Badge className="bg-orange-500">Normal</Badge>}
                    {claim.priority === ClaimPriority.LOW && <Badge className="bg-blue-500">Baja</Badge>}
                    {!claim.priority && <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell>{getStatusBadge(claim.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => setSelectedClaim(claim)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ver detalles</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => updateClaimStatus(claim.id, claim.status === ClaimStatus.PENDING ? ClaimStatus.RESOLVED : ClaimStatus.PENDING)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{claim.status === ClaimStatus.PENDING ? 'Marcar como resuelto' : 'Reabrir reclamo'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      {/* Botón de Editar */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => {
                                // Guardar el buildingId actual junto con el claim
                                setEditingClaim({
                                  ...claim,
                                  // Usar el buildingId que ya viene en claim o usar el seleccionado
                                  buildingId: claim.buildingId || selectedBuildingId
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
                            className="h-8 w-8 text-red-500 hover:text-red-600" 
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
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Esto eliminará permanentemente el reclamo
                              y no podrá ser recuperado.
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
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No tienes reclamos registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      
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
                  onChange={(e) => setEditingClaim({...editingClaim, title: e.target.value})}
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
                  onChange={(e) => setEditingClaim({...editingClaim, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Estado
                </Label>
                <Select
                  defaultValue={editingClaim.status}
                  onValueChange={(value: ClaimStatus) => setEditingClaim({...editingClaim, status: value})}
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

      {/* Modal de detalles de reclamo */}
      <Dialog open={!!selectedClaim} onOpenChange={(open) => !open && setSelectedClaim(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedClaim?.title}</DialogTitle>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Descripción</h3>
                <p className="text-sm">{selectedClaim.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Estado</h3>
                  <div>{getStatusBadge(selectedClaim.status)}</div>
                </div>
                <div>
                  <h3 className="font-semibold">Creado</h3>
                  <p className="text-sm">{formatDate(selectedClaim.createdAt)}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Prioridad</h3>
                  <div>
                    {selectedClaim.priority === ClaimPriority.HIGH && <Badge className="bg-red-500">Alta</Badge>}
                    {selectedClaim.priority === ClaimPriority.URGENT && <Badge className="bg-red-600 font-bold">Urgente</Badge>}
                    {selectedClaim.priority === ClaimPriority.NORMAL && <Badge className="bg-orange-500">Normal</Badge>}
                    {selectedClaim.priority === ClaimPriority.LOW && <Badge className="bg-blue-500">Baja</Badge>}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">Ubicación</h3>
                  <p className="text-sm">
                    {(() => {
                      let spaceName = '';
                      let spaceType = '';
                      
                      if (selectedClaim.space?.name) {
                        spaceName = selectedClaim.space.name;
                        spaceType = selectedClaim.space.spaceType?.name || 'Espacio';
                        return `${spaceType}: ${spaceName}`;
                      } else if (selectedClaim.unit) {
                        spaceName = `${selectedClaim.unit.floor}-${selectedClaim.unit.number}`;
                        return `Unidad: ${spaceName}`;
                      } else if (selectedClaim.location === 'COMMON_AREA') {
                        spaceName = selectedClaim.locationDetail || 'Área común';
                        return `Área común: ${spaceName}`;
                      } else if (selectedClaim.location === 'BUILDING') {
                        spaceName = selectedClaim.locationDetail || 'Todo el edificio';
                        return `Edificio: ${spaceName}`;
                      } else {
                        spaceName = selectedClaim.locationDetail || '-';
                        return spaceName;
                      }
                    })()}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Reportado por</h3>
                <div className="flex items-center space-x-2">
                  {selectedClaim.creator ? (
                    <p className="text-sm">
                      {selectedClaim.creator.firstName} {selectedClaim.creator.lastName}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Usuario desconocido</p>
                  )}
                </div>
              </div>
              {selectedClaim.comments && selectedClaim.comments.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold mb-2">Comentarios ({selectedClaim.comments.length})</h3>
                  <div className="space-y-2">
                    {selectedClaim.comments.map((comment) => (
                      <div key={comment.id} className="bg-muted p-3 rounded-md">
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedClaim.attachments && selectedClaim.attachments.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold mb-2">Archivos adjuntos ({selectedClaim.attachments.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedClaim.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm flex items-center gap-1"
                      >
                        <span>{attachment.filename}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* No necesitamos footer con botón de cerrar, mantenemos consistencia con la vista de Claims */}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyClaimsPage;
