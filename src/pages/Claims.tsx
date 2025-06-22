import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Claim, ClaimStatus, ClaimLocation } from '@/types/claim';

// Interfaces para respuestas de API
interface TablesCheckResponse {
  setup_required: boolean;
  message: string;
}

interface TablesSetupResponse {
  success: boolean;
  message: string;
}
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { PlusCircle, Search, Settings, Loader2, Eye, Pencil, Trash2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

import { CreateClaimForm } from '@/components/Claims/CreateClaimForm';

const Claims = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all');
  const [spaceTypeFilter, setSpaceTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [tablesConfigured, setTablesConfigured] = useState<boolean | null>(null);
  const [configuring, setConfiguring] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<Record<string, boolean>>({});
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const checkTablesConfiguration = async () => {
      if (!currentUser?.buildingId) return;
      
      try {
        console.log(`Verificando tablas para el edificio ID: ${currentUser.buildingId}`);
        
        const response = await api.get<TablesCheckResponse>(`/buildings/${currentUser.buildingId}/claims/check-tables`);
        
        // Con axios la respuesta ya incluye los datos en response.data
        console.log('Respuesta de verificación de tablas:', response.data);
        setTablesConfigured(!response.data.setup_required);
        setLoading(false);
      } catch (error) {
        console.error('Error al verificar tablas:', error);
        setTablesConfigured(false);
        setLoading(false);
      }
    };
    
    checkTablesConfiguration();
  }, [currentUser]);

  const setupTables = async () => {
    if (!currentUser?.buildingId) return;
    
    setConfiguring(true);
    try {
      console.log(`Configurando tablas para el edificio ID: ${currentUser.buildingId}`);
      
      const response = await api.post<TablesSetupResponse>(`/buildings/${currentUser.buildingId}/claims/setup-tables`);
      
      console.log('Respuesta de configuración de tablas:', response.data);
      
      setTablesConfigured(response.data.success);
      if (response.data.success) {
        toast.success('Tablas configuradas correctamente');
        // Cargar los reclamos una vez configuradas las tablas
        fetchClaims();
      } else {
        toast.error(`Error: ${response.data.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al configurar tablas:', error);
      toast.error(`Error al configurar las tablas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setConfiguring(false);
    }
  };

  const fetchClaims = async () => {
    if (!currentUser?.buildingId) return;
    
    setLoading(true);
    try {
      const response = await api.get<Claim[]>(`/buildings/${currentUser.buildingId}/claims`);
      
      const claims = Array.isArray(response.data) ? response.data : [];
      // Imprimir los datos de reclamos para diagnóstico
      console.log('Claims data received:', claims);
      claims.forEach(claim => {
        console.log(`Claim ${claim.id} - space:`, claim.space, 'location:', claim.location, 'locationDetail:', claim.locationDetail);
      });
      
      setClaims(claims);
      setFilteredClaims(claims);
    } catch (error) {
      console.error('Error al obtener reclamos:', error);
      toast.error('Error al cargar los reclamos. Por favor, verifica que las tablas estén configuradas correctamente');
      
      setClaims([]);
      setFilteredClaims([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tablesConfigured) {
      fetchClaims();
    }
  }, [tablesConfigured, currentUser]);

  // Función para extraer el tipo de espacio de un reclamo
  const getSpaceType = (claim: Claim): string => {
    if (claim.space?.spaceType?.name) {
      // Usar el nombre real del tipo de espacio desde la base de datos
      return claim.space.spaceType.name;
    } else if (claim.unit) {
      return 'Unidad';
    } else if (claim.location === 'COMMON_AREA') {
      return 'Área común';
    } else if (claim.location === 'BUILDING') {
      return 'Edificio';
    } else {
      return 'Otro';
    }
  };

  // Obtener todos los tipos de espacio únicos de los reclamos
  const getUniqueSpaceTypes = (claims: Claim[]): string[] => {
    const types = claims.map(claim => {
      if (claim.space?.spaceType?.name) {
        return claim.space.spaceType.name;
      } else if (claim.unit) {
        return 'Unidad';
      } else if (claim.location === 'COMMON_AREA') {
        return 'Área común';
      } else if (claim.location === 'BUILDING') {
        return 'Edificio';
      } else {
        return 'Otro';
      }
    });
    return Array.from(new Set(types)).sort();
  };
  
  useEffect(() => {
    if (claims.length > 0) {
      let filtered = [...claims];
      
      // Filtrar por estado
      if (statusFilter !== 'all') {
        filtered = filtered.filter(claim => claim.status === statusFilter);
      }
      
      // Filtrar por tipo de espacio
      if (spaceTypeFilter !== 'all') {
        filtered = filtered.filter(claim => {
          let type = 'Otro';
          
          if (claim.space?.spaceType?.name) {
            type = claim.space.spaceType.name;
          } else if (claim.unit) {
            type = 'Unidad';
          } else if (claim.location === 'COMMON_AREA') {
            type = 'Área común';
          } else if (claim.location === 'BUILDING') {
            type = 'Edificio';
          }
          
          return type === spaceTypeFilter;
        });
      }
      
      // Filtrar por término de búsqueda
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(claim => 
          claim.title.toLowerCase().includes(term) || 
          claim.description.toLowerCase().includes(term)
        );
      }
      
      setFilteredClaims(filtered);
    }
  }, [claims, searchTerm, statusFilter, spaceTypeFilter]);

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
        return null;
    }
  };

  const getLocationLabel = (location: ClaimLocation) => {
    const locations: Record<ClaimLocation, string> = {
      [ClaimLocation.UNIT]: 'Unidad',
      [ClaimLocation.COMMON_AREA]: 'Área Común',
      [ClaimLocation.BUILDING]: 'Edificio'
    };
    
    return locations[location] || location;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  // Determina si el reclamo pertenece al usuario actual
  const isOwnClaim = (claim: Claim) => {
    return claim.creatorId === currentUser?.id;
  };
  
  // Función para eliminar un reclamo
  const deleteClaim = async (claimId: string) => {
    if (!currentUser?.buildingId) return;
    
    try {
      const response = await api.delete(`/buildings/${currentUser.buildingId}/claims/${claimId}`);
      
      if (response.status === 200) {
        toast.success('Reclamo eliminado correctamente');
        // Actualizar la lista de reclamos
        fetchClaims();
      }
    } catch (error) {
      console.error('Error al eliminar reclamo:', error);
      toast.error('Error al eliminar el reclamo');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedClaim(null);
    }
  };

  const updateClaim = async (id: string, data: Partial<Claim>) => {
    try {
      await api.patch(`/buildings/${currentUser?.buildingId}/claims/${id}`, data);
      toast.success("Reclamo actualizado correctamente");
      
      // Actualizar la lista de reclamos
      fetchClaims();
      setEditingClaim(null);
    } catch (error) {
      console.error("Error al actualizar el reclamo:", error);
      toast.error("Error al actualizar el reclamo");
    }
  };

  // Función para actualizar el estado de un reclamo
  const updateClaimStatus = async (claimId: string, newStatus: ClaimStatus) => {
    if (!currentUser?.buildingId) return;
    
    try {
      // Cerrar el dropdown inmediatamente para evitar que bloquee la interacción
      setDropdownOpen(prev => Object.keys(prev).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {} as Record<string, boolean>));
      
      const response = await api.patch(`/buildings/${currentUser.buildingId}/claims/${claimId}`, {
        status: newStatus
      });
      
      if (response.status === 200) {
        toast.success(`Estado del reclamo actualizado a ${newStatus}`);
        // Actualizar la lista de reclamos
        fetchClaims();
      }
    } catch (error) {
      console.error('Error al actualizar estado del reclamo:', error);
      toast.error('Error al actualizar el estado del reclamo');
    } finally {
      setStatusUpdateOpen(false);
      setSelectedClaim(null);
    }
  };
  
  // Función para abrir el drawer con los detalles del reclamo
  const showClaimDetails = (claim: Claim) => {
    setSelectedClaim(claim);
  };

  const toggleRowExpansion = (claimId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [claimId]: !prev[claimId]
    }));
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reclamos</h1>
        
        {tablesConfigured && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nuevo Reclamo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Reclamo</DialogTitle>
                <DialogDescription>
                  Complete el formulario para crear un nuevo reclamo.
                </DialogDescription>
              </DialogHeader>
              <CreateClaimForm onSuccess={() => setIsOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {tablesConfigured === false && !configuring && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Configuración inicial requerida</h2>
          <p className="mb-4">Es necesario configurar las tablas de reclamos antes de comenzar.</p>
          <Button onClick={setupTables} disabled={configuring}>
            {configuring ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Configurando...
              </>
            ) : (
              'Configurar ahora'
            )}
          </Button>
        </div>
      )}
      
      {tablesConfigured && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar reclamos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
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
              value={spaceTypeFilter}
              onValueChange={(value: string) => setSpaceTypeFilter(value)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tipo de Espacio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los espacios</SelectItem>
                {claims.length > 0 && 
                  getUniqueSpaceTypes(claims).map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      {tablesConfigured ? (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Listado de Reclamos</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reclamo</TableHead>
                <TableHead>Espacio/Unidad</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                {currentUser?.role === 'BUILDING_ADMIN' || currentUser?.role === 'SUPER_ADMIN' ? (
                  <TableHead>Creador</TableHead>
                ) : null}
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Cargando...
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
                        {(() => {
                          // Contenido principal (nombre del espacio)
                          let spaceName = '';
                          // Tipo de espacio (categoría)
                          let spaceType = '';
                          // Clase para el estilo del contenido principal
                          let mainClass = 'font-medium';
                        // Clase para el estilo del tipo de espacio
                        let typeClass = 'text-xs text-gray-500 mt-1';
                        
                        if (claim.space?.name) {
                          spaceName = claim.space.name;
                          spaceType = claim.space.spaceType?.name || 'Espacio';
                          mainClass += ' text-blue-700';
                        } else if (claim.unit) {
                          spaceName = `${claim.unit.floor}-${claim.unit.number}`;
                          spaceType = 'Unidad';
                          mainClass += ' text-orange-700';
                        } else if (claim.location === 'COMMON_AREA') {
                          spaceName = claim.locationDetail || 'Área común';
                          spaceType = 'Área común';
                          mainClass += ' text-green-700';
                        } else if (claim.location === 'BUILDING') {
                          spaceName = claim.locationDetail || 'Todo el edificio';
                          spaceType = 'Edificio';
                          mainClass += ' text-purple-700';
                        } else {
                          spaceName = claim.locationDetail || '-';
                          spaceType = 'Otro';
                        }

                        return (
                          <div className="flex flex-col">
                            <span className={mainClass}>{spaceName}</span>
                            <span className={typeClass}>{spaceType}</span>
                          </div>
                        );
                      })()} 
                    </TableCell>
                    <TableCell>{formatDate(claim.createdAt)}</TableCell>
                    <TableCell>{getStatusBadge(claim.status)}</TableCell>
                    {currentUser?.role === 'BUILDING_ADMIN' || currentUser?.role === 'SUPER_ADMIN' ? (
                      <TableCell>
                        {claim.creator ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {claim.creator.firstName} {claim.creator.lastName}
                          </Badge>
                        ) : '-'}
                      </TableCell>
                    ) : null}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <Button 
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => showClaimDetails(claim)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Ver detalles</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Actualizar estado - solo para admin o creador */}
                        {(currentUser?.role === 'BUILDING_ADMIN' || currentUser?.role === 'SUPER_ADMIN' || isOwnClaim(claim)) && (
                          <DropdownMenu 
                            open={dropdownOpen[claim.id] || false}
                            onOpenChange={(open) => {
                              setDropdownOpen(prev => ({
                                ...prev,
                                [claim.id]: open
                              }));
                            }}
                          >
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <RefreshCw className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Actualizar estado</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <DropdownMenuContent 
                              onEscapeKeyDown={() => {
                                setDropdownOpen(prev => ({ ...prev, [claim.id]: false }));
                              }}
                              onInteractOutside={() => {
                                setDropdownOpen(prev => ({ ...prev, [claim.id]: false }));
                              }}
                            >
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedClaim(claim);
                                  updateClaimStatus(claim.id, ClaimStatus.PENDING);
                                }}
                              >
                                Pendiente
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedClaim(claim);
                                  updateClaimStatus(claim.id, ClaimStatus.IN_PROGRESS);
                                }}
                              >
                                En Progreso
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedClaim(claim);
                                  updateClaimStatus(claim.id, ClaimStatus.RESOLVED);
                                }}
                              >
                                Resuelto
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedClaim(claim);
                                  updateClaimStatus(claim.id, ClaimStatus.CANCELLED);
                                }}
                              >
                                Cancelado
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}

                        {/* Editar - solo si es propio */}
                        {isOwnClaim(claim) && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  <Button 
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditingClaim(claim)}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Editar reclamo</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        {/* Eliminar - solo si es propio */}
                        {isOwnClaim(claim) && (
                          <AlertDialog>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                      </Button>
                                    </AlertDialogTrigger>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Eliminar reclamo</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción eliminará permanentemente el reclamo y no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteClaim(claim.id)} className="bg-red-500 hover:bg-red-600">
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No hay reclamos disponibles
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      ) : null}

      {/* Dialog para mostrar detalles del reclamo */}
      <Dialog open={!!selectedClaim} onOpenChange={(open) => !open && setSelectedClaim(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedClaim?.title}</DialogTitle>
            <DialogDescription>Detalles del reclamo</DialogDescription>
          </DialogHeader>
          
          {selectedClaim && (
            <div className="space-y-5 py-2">
              <div>
                <h3 className="text-md font-semibold mb-1">Descripción</h3>
                <p className="text-sm">{selectedClaim.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <h3 className="text-md font-semibold mb-1">Estado</h3>
                  <div>{getStatusBadge(selectedClaim.status)}</div>
                </div>
                
                <div>
                  <h3 className="text-md font-semibold mb-1">Fecha de creación</h3>
                  <p className="text-sm">{formatDate(selectedClaim.createdAt)}</p>
                </div>
                
                <div>
                  <h3 className="text-md font-semibold mb-1">Espacio/Unidad</h3>
                  <div className="text-sm">
                    {(() => {
                      // Contenido principal (nombre del espacio)
                      let spaceName = '';
                      // Tipo de espacio (categoría)
                      let spaceType = '';
                      // Clase para el estilo del contenido principal
                      let mainClass = 'font-medium';
                      // Clase para el estilo del tipo de espacio
                      let typeClass = 'text-xs text-gray-500 mt-1';
                      
                      if (selectedClaim.space?.name) {
                        spaceName = selectedClaim.space.name;
                        spaceType = selectedClaim.space.spaceType?.name || 'Espacio';
                        mainClass += ' text-blue-700';
                      } else if (selectedClaim.unit) {
                        spaceName = `${selectedClaim.unit.floor}-${selectedClaim.unit.number}`;
                        spaceType = 'Unidad';
                        mainClass += ' text-orange-700';
                      } else if (selectedClaim.location === 'COMMON_AREA') {
                        spaceName = selectedClaim.locationDetail || 'Área común';
                        spaceType = 'Área común';
                        mainClass += ' text-green-700';
                      } else if (selectedClaim.location === 'BUILDING') {
                        spaceName = selectedClaim.locationDetail || 'Todo el edificio';
                        spaceType = 'Edificio';
                        mainClass += ' text-purple-700';
                      } else {
                        spaceName = selectedClaim.locationDetail || '-';
                        spaceType = 'Otro';
                      }
                      
                      return (
                        <div className="flex flex-col">
                          <span className={mainClass}>{spaceName}</span>
                          <span className={typeClass}>{spaceType}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-semibold mb-1">Creador</h3>
                  {selectedClaim.creator ? (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {selectedClaim.creator.firstName} {selectedClaim.creator.lastName}
                    </Badge>
                  ) : <p className="text-sm">-</p>}
                </div>
              </div>
              
              {selectedClaim.comments && selectedClaim.comments.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold mb-2">Comentarios ({selectedClaim.comments.length})</h3>
                  <div className="space-y-2 max-h-40 overflow-auto">
                    {selectedClaim.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 p-2 rounded-md">
                        <p className="text-sm">{comment.content}</p>
                        <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedClaim.attachments && selectedClaim.attachments.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold mb-2">Archivos adjuntos ({selectedClaim.attachments.length})</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedClaim.attachments.map((attachment) => (
                      <div key={attachment.id} className="border rounded-md p-2">
                        <p className="text-sm truncate">{attachment.filename}</p>
                        <a 
                          href={attachment.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Ver archivo
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setSelectedClaim(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar reclamo */}
      <Dialog open={!!editingClaim} onOpenChange={(open) => !open && setEditingClaim(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Reclamo</DialogTitle>
            <DialogDescription>
              Modifica la información del reclamo.
            </DialogDescription>
          </DialogHeader>
          {editingClaim && (
            <div className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="grid w-full gap-2">
                  <Label htmlFor="title">Título</Label>
                  <Input 
                    id="title" 
                    defaultValue={editingClaim.title} 
                    onChange={(e) => setEditingClaim({...editingClaim, title: e.target.value})}
                  />
                </div>
                <div className="grid w-full gap-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea 
                    id="description" 
                    defaultValue={editingClaim.description} 
                    onChange={(e) => setEditingClaim({...editingClaim, description: e.target.value})}
                  />
                </div>
                <div className="grid w-full gap-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    defaultValue={editingClaim.status}
                    onValueChange={(value: ClaimStatus) => setEditingClaim({...editingClaim, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pendiente</SelectItem>
                      <SelectItem value="IN_PROGRESS">En progreso</SelectItem>
                      <SelectItem value="RESOLVED">Resuelto</SelectItem>
                      <SelectItem value="CLOSED">Cerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingClaim(null)}>Cancelar</Button>
                <Button onClick={() => updateClaim(editingClaim.id, {
                  title: editingClaim.title,
                  description: editingClaim.description,
                  status: editingClaim.status
                })}>Guardar cambios</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Claims;
