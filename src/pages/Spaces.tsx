
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Search, Edit, Trash2, Grid, LayoutGrid, Loader2, Save, X, Building, Users, Activity, Settings2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import UnitMonitor from '@/components/Spaces/UnitMonitor';
import { InviteUserModal } from '@/components/Invitations/InviteUserModal';
import { BulkInviteImporter } from '@/components/Invitations/BulkInviteImporter';
import { Mail, Upload } from 'lucide-react';


interface Space {
  id: string;
  name: string;
  type: {
    id: string;
    name: string;
    isReservable: boolean;
    isAssignable: boolean;
  };
  floor?: string;
  description?: string;
  owners?: any[]; // Keep flexible for now, or define if needed
}

interface SpaceType {
  id: string;
  name: string;
  description?: string;
  isReservable: boolean;
  isAssignable: boolean;
  isActive: boolean;
}

export default function Spaces() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spaceTypes, setSpaceTypes] = useState<SpaceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [unitTypeId, setUnitTypeId] = useState<string | null>(null);

  // New Main View State
  const [mainView, setMainView] = useState<'monitor' | 'inventory'>('monitor');
  const [inventoryTab, setInventoryTab] = useState("common");

  // Modals state
  const [showAddSpaceModal, setShowAddSpaceModal] = useState(false);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showEditSpaceModal, setShowEditSpaceModal] = useState(false);

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showManageTypesModal, setShowManageTypesModal] = useState(false);

  // Selection state
  const [spaceToEdit, setSpaceToEdit] = useState<Space | null>(null);
  const [spaceToDelete, setSpaceToDelete] = useState<Space | null>(null);
  const [typeToEdit, setTypeToEdit] = useState<SpaceType | null>(null);

  // Form handling
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSpace, setNewSpace] = useState({
    name: '',
    typeId: '',
    floor: '',
    description: ''
  });

  const [newUnit, setNewUnit] = useState({
    name: '',
    floor: '',
    description: ''
  });

  const [newSpaceType, setNewSpaceType] = useState<Partial<SpaceType>>({
    name: '',
    description: '',
    isReservable: false,
    isAssignable: false,
    isActive: true
  });

  // Invitation State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showBulkInviteModal, setShowBulkInviteModal] = useState(false);
  const [unitToInvite, setUnitToInvite] = useState<Space | null>(null);

  // Batch Creation State

  const [showBatchCreateModal, setShowBatchCreateModal] = useState(false);
  const [batchConfig, setBatchConfig] = useState({
    totalFloors: '0',
    unitsPerFloor: '0',
    startFloor: '0', // 0 for PB, 1 for 1st floor
    nomenclature: '1A' as '1A' | '101' | 'A1',
  });
  const [previewUnits, setPreviewUnits] = useState<{ name: string; floor: string }[]>([]);

  // Update preview when config changes
  useEffect(() => {
    if (!showBatchCreateModal) return;

    const floors = parseInt(batchConfig.totalFloors) || 0;
    const units = parseInt(batchConfig.unitsPerFloor) || 0;
    const start = parseInt(batchConfig.startFloor) || 0;
    const generated: { name: string; floor: string }[] = [];

    if (floors > 0 && units > 0) {
      for (let f = 0; f < floors; f++) {
        const floorNum = start + f;
        const floorStr = floorNum === 0 ? 'PB' : floorNum.toString();

        for (let u = 0; u < units; u++) {
          let unitName = '';
          const letter = String.fromCharCode(65 + u); // A, B, C...

          switch (batchConfig.nomenclature) {
            case '1A':
              unitName = `${floorStr}${letter}`;
              break;
            case '101':
              // If floor is PB, maybe just use number 1, 2... or PB-1?
              // Standard hotel style: Floor 1 -> 101, Floor 2 -> 201
              if (floorNum === 0) {
                unitName = `PB-${u + 1}`;
              } else {
                unitName = `${floorNum}${String(u + 1).padStart(2, '0')}`;
              }
              break;
            case 'A1':
              // Letter first logic not standard for multi-floor but user asked?
              // Let's assume Tower A, Unit 1? Or just A1, A2... usually per floor needs floor indicator.
              // Let's stick to "Block/Letter + Number" style if needed, but for now simple 1A is best.
              // User example: "A, B, C...". If single floor or just sequential?
              // Let's implement A1 as: Unit A on Floor 1? No, usually 1A is Floor 1 Unit A.
              // User said: "A, B, C... etc". Maybe just letters?
              // Let's stick to 1A and 101 for now as safe defaults, and maybe just Letter if floors=1.
              // For "A1", let's assume FloorStr + Letter is "1A".
              // Let's try to interpret "A1" as "Letter + Floor"?
              unitName = `${letter}${floorStr}`;
              break;
          }
          generated.push({ name: unitName, floor: floorStr });
        }
      }
    }
    setPreviewUnits(generated);
  }, [batchConfig, showBatchCreateModal]);


  const handleOpenBatchModal = async () => {
    // Pre-fill from building data if possible
    setShowBatchCreateModal(true);
    if (currentUser?.buildingId) {
      const { data } = await supabase.from('buildings').select('floors, totalUnits').eq('id', currentUser.buildingId).single();
      if (data) {
        setBatchConfig(prev => ({
          ...prev,
          totalFloors: data.floors?.toString() || '0',
          // Approximate units per floor if total is known?
          unitsPerFloor: data.totalUnits && data.floors ? Math.ceil(data.totalUnits / data.floors).toString() : '0'
        }));
      }
    }
  };

  const handleBatchCreate = async () => {
    if (!unitTypeId || previewUnits.length === 0) return;

    setIsSubmitting(true);
    try {
      const unitsToInsert = previewUnits.map(u => ({
        name: u.name,
        floor: u.floor,
        spaceTypeId: unitTypeId,
        buildingId: currentUser?.buildingId,
        description: 'Generado automáticamente'
      }));

      // Insert into spaces
      const { error: spacesError } = await supabase.from('spaces').insert(unitsToInsert);
      if (spacesError) throw spacesError;

      // Insert into units (for owners)
      const ownersUnitsToInsert = previewUnits.map(u => ({
        number: u.name,
        floor: u.floor,
        buildingId: currentUser?.buildingId,
        // ownerId is null initially
      }));

      const { error: unitsError } = await supabase.from('units').insert(ownersUnitsToInsert);
      if (unitsError) throw unitsError;

      // Update building info with new configuration if it was used
      if (currentUser?.buildingId) {
        const floors = parseInt(batchConfig.totalFloors) || 0;
        const unitsPerFloor = parseInt(batchConfig.unitsPerFloor) || 0;
        const calculatedTotalUnits = floors * unitsPerFloor;

        // Silent update to persist building metadata
        // Only update if we have valid non-zero values
        if (floors > 0) {
          await supabase.from('buildings').update({
            floors: floors,
            totalUnits: calculatedTotalUnits
          }).eq('id', currentUser.buildingId);
        }
      }

      toast({ title: "Éxito", description: `${unitsToInsert.length} unidades creadas y asignadas para propietarios.` });
      setShowBatchCreateModal(false);
      fetchSpaces();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Falló la creación masiva: " + (error as any).message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchSpaces = async () => {
    if (!currentUser?.buildingId) return;

    setIsLoading(true);
    try {
      // Fetch spaces with their types
      const { data: spacesData, error: spacesError } = await supabase
        .from('spaces')
        .select(`
          *,
          type:space_types (*)
        `)
        .eq('buildingId', currentUser.buildingId)
        .order('name');

      if (spacesError) throw spacesError;

      // Fetch space types
      const { data: typesData, error: typesError } = await supabase
        .from('space_types')
        .select('*')
        .eq('buildingId', currentUser.buildingId)
        .order('name');

      if (typesError) throw typesError;

      setSpaces(spacesData || []);
      setSpaceTypes(typesData || []);

      const unitType = (typesData || []).find(t => t.name === 'Unidad');
      if (unitType) setUnitTypeId(unitType.id);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los espacios",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, [currentUser?.buildingId]);

  // Ensure "Unidad" type exists
  useEffect(() => {
    const ensureUnitType = async () => {
      if (!currentUser?.buildingId || isLoading || unitTypeId) return;

      // Check if we already have it in the fetched types (double check)
      const existing = spaceTypes.find(t => t.name === 'Unidad');
      if (existing) {
        setUnitTypeId(existing.id);
        return;
      }

      // If not, create it
      try {
        const { data, error } = await supabase.from('space_types').insert({
          name: 'Unidad',
          description: 'Unidad Funcional / Departamento',
          isReservable: false, // Usually units are private, not reservable common spaces
          isAssignable: true,
          buildingId: currentUser.buildingId,
          isActive: true
        }).select().single();

        if (error) throw error;
        if (data) {
          setUnitTypeId(data.id);
          fetchSpaces(); // Refresh list to show it
        }
      } catch (err) {
        console.error("Error creating system unit type:", err);
      }
    };

    if (!isLoading && spaceTypes.length > 0) {
      ensureUnitType();
    }
  }, [currentUser?.buildingId, isLoading, spaceTypes, unitTypeId]);

  const handleCreateSpace = async () => {
    if (!currentUser?.buildingId || !newSpace.name || !newSpace.typeId) {
      toast({ title: "Error", description: "Completa los campos requeridos", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('spaces').insert({
        name: newSpace.name,
        spaceTypeId: newSpace.typeId,
        floor: newSpace.floor,
        description: newSpace.description,
        buildingId: currentUser.buildingId
      });

      if (error) throw error;

      toast({ title: "Éxito", description: "Espacio creado correctamente" });
      setShowAddSpaceModal(false);
      setNewSpace({ name: '', typeId: '', floor: '', description: '' });
      fetchSpaces();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo crear el espacio", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateUnit = async () => {
    if (!currentUser?.buildingId || !newUnit.name || !unitTypeId) {
      toast({ title: "Error", description: "Completa los campos requeridos", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create in spaces
      const { error: spaceError } = await supabase.from('spaces').insert({
        name: newUnit.name,
        spaceTypeId: unitTypeId,
        floor: newUnit.floor,
        description: newUnit.description,
        buildingId: currentUser.buildingId
      });

      if (spaceError) throw spaceError;

      // Create in units
      const { error: unitError } = await supabase.from('units').insert({
        number: newUnit.name,
        floor: newUnit.floor,
        buildingId: currentUser.buildingId
      });

      if (unitError) throw unitError;

      toast({ title: "Éxito", description: "Unidad creada correctamente" });
      setShowAddUnitModal(false);
      setNewUnit({ name: '', floor: '', description: '' });
      fetchSpaces();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo crear la unidad", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSpace = async () => {
    if (!spaceToEdit) return;

    setIsSubmitting(true);
    try {
      const isUnit = spaceToEdit.type.name === 'Unidad';
      const oldName = spaceToEdit.name;

      const { error } = await supabase.from('spaces').update({
        name: newSpace.name,
        spaceTypeId: newSpace.typeId,
        floor: newSpace.floor,
        description: newSpace.description
      }).eq('id', spaceToEdit.id);

      if (error) throw error;

      // If it is a unit, update the corresponding unit in units table
      if (isUnit) {
        // We match by old name since id is different
        const { error: unitError } = await supabase.from('units')
          .update({
            number: newSpace.name,
            floor: newSpace.floor
          })
          .eq('buildingId', currentUser?.buildingId)
          .eq('number', oldName); // Optimistic: assume name was unique

        if (unitError) console.error("Error updating synced unit:", unitError);
      }

      toast({ title: "Éxito", description: "Espacio actualizado" });
      setShowEditSpaceModal(false);
      setSpaceToEdit(null);
      fetchSpaces();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Fallo al actualizar", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSpace = async () => {
    if (!spaceToDelete) return;
    try {
      const isUnit = spaceToDelete.type?.name === 'Unidad';

      const { error } = await supabase.from('spaces').delete().eq('id', spaceToDelete.id);
      if (error) throw error;

      if (isUnit) {
        const { error: unitError } = await supabase.from('units')
          .delete()
          .eq('buildingId', currentUser?.buildingId)
          .eq('number', spaceToDelete.name);

        if (unitError) console.error("Error deleting synced unit:", unitError);
      }

      toast({ title: "Eliminado", description: "Espacio eliminado" });
      setShowDeleteConfirmModal(false);
      fetchSpaces();
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" });
    }
  };

  const handleCreateType = async () => {
    if (!currentUser?.buildingId || !newSpaceType.name) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('space_types').insert({
        name: newSpaceType.name,
        description: newSpaceType.description,
        isReservable: newSpaceType.isReservable,
        isAssignable: newSpaceType.isAssignable,
        buildingId: currentUser.buildingId,
        isActive: true
      });
      if (error) throw error;
      toast({ title: "Éxito", description: "Tipo creado" });
      fetchSpaces(); // Refresh types list
      setNewSpaceType({ name: '', description: '', isReservable: false, isAssignable: false, isActive: true });
    } catch (error) {
      toast({ title: "Error", description: "Error al crear tipo", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateType = async () => {
    if (!typeToEdit) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('space_types').update({
        name: newSpaceType.name,
        description: newSpaceType.description,
        isReservable: newSpaceType.isReservable,
        isAssignable: newSpaceType.isAssignable,
        // isActive is handled separately or included if we want to edit it here too
      }).eq('id', typeToEdit.id);

      if (error) throw error;
      toast({ title: "Éxito", description: "Tipo actualizado" });
      fetchSpaces();
      setTypeToEdit(null);
      setNewSpaceType({ name: '', description: '', isReservable: false, isAssignable: false, isActive: true });
    } catch (error) {
      toast({ title: "Error", description: "Error al actualizar tipo", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTypeStatus = async (type: SpaceType) => {
    try {
      const { error } = await supabase.from('space_types').update({
        isActive: !type.isActive
      }).eq('id', type.id);

      if (error) throw error;
      // Optimistic update or refetch
      fetchSpaces();
      toast({ title: "Estado actualizado", description: `Tipo ${!type.isActive ? 'activado' : 'desactivado'}` });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo cambiar el estado", variant: "destructive" });
    }
  };

  const startEditType = (type: SpaceType) => {
    setTypeToEdit(type);
    setNewSpaceType({
      name: type.name,
      description: type.description || '',
      isReservable: type.isReservable,
      isAssignable: type.isAssignable,
      isActive: type.isActive
    });
  };

  const cancelEditType = () => {
    setTypeToEdit(null);
    setNewSpaceType({ name: '', description: '', isReservable: false, isAssignable: false, isActive: true });
  };


  const filteredSpaces = spaces.filter(space => {
    const matchesSearch = space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      space.type.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || space.type.id === selectedType;
    return matchesSearch && matchesType;
  });

  const commonSpaces = filteredSpaces.filter(s => s.type.name !== 'Unidad');
  const unitSpaces = filteredSpaces.filter(s => s.type.name === 'Unidad');

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Espacios</h1>
          <p className="text-muted-foreground mt-1">Gestiona los espacios comunes y unidades de tu edificio.</p>
        </div>
      </div>

      <Tabs defaultValue="monitor" value={mainView} onValueChange={(val: any) => setMainView(val)} className="w-full">
        <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="monitor" className="gap-2">
            <Activity className="h-4 w-4" /> Monitor de Estados
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2">
            <Settings2 className="h-4 w-4" /> Gestión e Inventario
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitor" className="mt-0">
          <UnitMonitor spaces={spaces} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="inventory" className="mt-0 space-y-6">
          {/* Inventory Header Controls */}
          <div className="flex justify-end gap-2 mb-4">
            <Button variant="outline" onClick={() => setShowManageTypesModal(true)}>
              Tipos de espacios
            </Button>
            <Button onClick={() => setShowAddSpaceModal(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Nuevo espacio
            </Button>
          </div>

          <Tabs defaultValue="common" value={inventoryTab} onValueChange={setInventoryTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="common" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" /> Espacios Comunes
              </TabsTrigger>
              <TabsTrigger value="units" className="flex items-center gap-2">
                <Building className="h-4 w-4" /> Unidades Funcionales
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-2 mb-6 bg-white p-4 rounded-lg border shadow-sm">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={inventoryTab === 'units' ? "Buscar unidad..." : "Buscar por nombre o tipo..."}
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {inventoryTab === 'common' && (
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {spaceTypes.filter(t => t.name !== 'Unidad').map(type => (
                      <SelectItem key={type.id} value={type.id} disabled={!type.isActive} className={!type.isActive ? 'opacity-50' : ''}>
                        {type.name} {!type.isActive && '(Inactivo)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {inventoryTab === 'units' && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleOpenBatchModal} disabled={!unitTypeId}>
                    <Grid className="mr-2 h-4 w-4" /> Generar en Lote
                  </Button>
                  <Button variant="outline" onClick={() => setShowBulkInviteModal(true)} disabled={!unitTypeId}>
                    <Upload className="mr-2 h-4 w-4" /> Importar Invitaciones
                  </Button>
                  <Button onClick={() => setShowAddUnitModal(true)} disabled={!unitTypeId}>

                    <PlusCircle className="mr-2 h-4 w-4" /> Nueva Unidad
                  </Button>
                </div>
              )}
            </div>

            <TabsContent value="common" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : commonSpaces.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed">
                  <LayoutGrid className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No se encontraron espacios comunes</h3>
                  <p className="text-muted-foreground">Crea tipos (ej. SUM, Cochera) y espacios para comenzar.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {commonSpaces.map(space => (
                    <Card key={space.id} className="p-5 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant="outline" className="bg-slate-50">{space.type.name}</Badge>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => {
                              setSpaceToEdit(space);
                              setNewSpace({
                                name: space.name,
                                typeId: space.type.id,
                                floor: space.floor || '',
                                description: space.description || ''
                              });
                              setShowEditSpaceModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              setSpaceToDelete(space);
                              setShowDeleteConfirmModal(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {space.type.isReservable && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-2 py-0.5 text-[10px]">Reservable</Badge>}
                        {space.type.isAssignable && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-2 py-0.5 text-[10px]">Asignable</Badge>}
                      </div>
                      <h3 className="text-xl font-bold mb-1">{space.name}</h3>
                      {space.floor && <p className="text-sm text-muted-foreground mb-2">Piso: {space.floor}</p>}
                      <p className="text-sm text-slate-600 line-clamp-2">{space.description || "Sin descripción"}</p>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="units" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : unitSpaces.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed">
                  <Building className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No se encontraron unidades</h3>
                  <p className="text-muted-foreground">Crea unidades (departamentos) para asignar propietarios.</p>
                  <Button variant="outline" className="mt-4" onClick={() => setShowAddUnitModal(true)}>
                    Crear primera unidad
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  {(() => {
                    // Group logic inline for display
                    const groups: Record<string, typeof unitSpaces> = {};
                    unitSpaces.forEach((unit) => {
                      const floor = unit.floor || 'Sin Piso';
                      if (!groups[floor]) groups[floor] = [];
                      groups[floor].push(unit);
                    });

                    const sortedFloors = Object.keys(groups).sort((a, b) => {
                      if (a === 'PB') return b === 'Subsuelo' ? 1 : -1;
                      if (b === 'PB') return a === 'Subsuelo' ? -1 : 1;
                      if (a === 'Subsuelo') return -1;
                      if (b === 'Subsuelo') return 1;
                      if (a === 'Sin Piso') return 1;
                      if (b === 'Sin Piso') return -1;
                      const numA = parseInt(a);
                      const numB = parseInt(b);
                      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                      return a.localeCompare(b);
                    });

                    return sortedFloors.map(floor => {
                      const units = groups[floor];
                      const displayFloor = floor === 'PB' ? 'Planta Baja' : `Piso ${floor}`;
                      const floorInitial = floor === 'PB' ? 'PB' : floor.replace('Piso ', '');

                      return (
                        <div key={floor} className="space-y-4">
                          {/* Floor Header */}
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-semibold text-sm">
                                {floorInitial}
                              </div>
                              <h3 className="text-lg font-semibold text-slate-800">{displayFloor}</h3>
                            </div>
                            <div className="h-px flex-1 bg-slate-100"></div>
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                              {units.length} {units.length === 1 ? 'Unidad' : 'Unidades'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {units.map(space => (
                              <Card key={space.id} className="group relative p-4 hover:shadow-md transition-all duration-200 border-slate-200 bg-white">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{space.name}</h3>
                                    {space.floor ? (
                                      <p className="text-xs text-slate-500 font-medium mt-1">Piso {space.floor}</p>
                                    ) : (
                                      <p className="text-xs text-slate-400 italic mt-1">Sin piso asignado</p>
                                    )}
                                  </div>

                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                      onClick={() => {
                                        setSpaceToEdit(space);
                                        setNewSpace({
                                          name: space.name,
                                          typeId: space.type.id,
                                          floor: space.floor || '',
                                          description: space.description || ''
                                        });
                                        setShowEditSpaceModal(true);
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                      onClick={() => {
                                        setSpaceToDelete(space);
                                        setShowDeleteConfirmModal(true);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                      onClick={() => {
                                        setUnitToInvite(space);
                                        setShowInviteModal(true);
                                      }}
                                      title="Invitar Propietario/Inquilino"
                                    >
                                      <Mail className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                {space.description && (
                                  <div className="mt-3 pt-3 border-t border-slate-50">
                                    <p className="text-xs text-slate-400 line-clamp-1">{space.description}</p>
                                  </div>
                                )}
                              </Card>
                            ))}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Add Space Modal */}
        <Dialog open={showAddSpaceModal} onOpenChange={setShowAddSpaceModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Espacio</DialogTitle>
              <DialogDescription>Completa los detalles del nuevo espacio.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" value={newSpace.name} onChange={e => setNewSpace({ ...newSpace, name: e.target.value })} placeholder="Ej. SUM, Cochera 1" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo</Label>
                <Select value={newSpace.typeId} onValueChange={val => setNewSpace({ ...newSpace, typeId: val })}>
                  <SelectTrigger><SelectValue placeholder="Selecciona el tipo" /></SelectTrigger>
                  <SelectContent>
                    {spaceTypes.filter(t => t.isActive).map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="floor">Piso/Ubicación (Opcional)</Label>
                <Input id="floor" value={newSpace.floor} onChange={e => setNewSpace({ ...newSpace, floor: e.target.value })} placeholder="Ej. PB, Subsuelo" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="desc">Descripción (Opcional)</Label>
                <Input id="desc" value={newSpace.description} onChange={e => setNewSpace({ ...newSpace, description: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddSpaceModal(false)}>Cancelar</Button>
              <Button onClick={handleCreateSpace} disabled={isSubmitting}>Crear</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invite User Modal */}
        {unitToInvite && (
          <InviteUserModal
            open={showInviteModal}
            onClose={() => {
              setShowInviteModal(false);
              setUnitToInvite(null);
            }}
            buildingId={currentUser?.buildingId || ''}
            unitId={unitToInvite.id}
            unitNumber={unitToInvite.name}
          />
        )}

        {/* Bulk Invite Modal */}
        <Dialog open={showBulkInviteModal} onOpenChange={setShowBulkInviteModal}>
          <DialogContent className="max-w-4xl">
            {/* We rely on BulkInviteImporter inside */}
            <BulkInviteImporter
              buildingId={currentUser?.buildingId || ''}
              onSuccess={() => setShowBulkInviteModal(false)}
              unitsMap={spaces.reduce((acc, s) => ({ ...acc, [s.name]: s.id }), {})}
            />
          </DialogContent>
        </Dialog>



        {/* Add Unit Modal */}
        < Dialog open={showAddUnitModal} onOpenChange={setShowAddUnitModal} >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Unidad</DialogTitle>
              <DialogDescription>Completa los detalles de la unidad funcional.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="unit-name">Identificador (Número/Letra)</Label>
                <Input id="unit-name" value={newUnit.name} onChange={e => setNewUnit({ ...newUnit, name: e.target.value })} placeholder="Ej. 1A, 201" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit-floor">Piso (Opcional)</Label>
                <Select value={newUnit.floor} onValueChange={v => setNewUnit({ ...newUnit, floor: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecciona un piso" /></SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    <SelectItem value="Subsuelo">Subsuelo</SelectItem>
                    <SelectItem value="PB">Planta Baja</SelectItem>
                    {Array.from({ length: 40 }, (_, i) => i + 1).map(num => (
                      <SelectItem key={num} value={num.toString()}>{`Piso ${num}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit-desc">Observaciones (Opcional)</Label>
                <Input id="unit-desc" value={newUnit.description} onChange={e => setNewUnit({ ...newUnit, description: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddUnitModal(false)}>Cancelar</Button>
              <Button onClick={handleCreateUnit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Crear Unidad
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog >


        {/* Batch Create Modal */}
        < Dialog open={showBatchCreateModal} onOpenChange={setShowBatchCreateModal} >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Generación Masiva de Unidades</DialogTitle>
              <DialogDescription>Configura los parámetros para crear múltiples unidades automáticamente.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <h4 className="font-medium text-sm border-b pb-2">Configuración</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Cantidad de Pisos</Label>
                    <Input type="number" value={batchConfig.totalFloors} onChange={e => setBatchConfig({ ...batchConfig, totalFloors: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Unidades por Piso</Label>
                    <Input type="number" value={batchConfig.unitsPerFloor} onChange={e => setBatchConfig({ ...batchConfig, unitsPerFloor: e.target.value })} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Piso Inicial</Label>
                  <Select value={batchConfig.startFloor} onValueChange={v => setBatchConfig({ ...batchConfig, startFloor: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Planta Baja (0)</SelectItem>
                      <SelectItem value="1">Piso 1</SelectItem>
                      <SelectItem value="-1">Subsuelo (-1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Formato de Nomenclatura</Label>
                  <Select value={batchConfig.nomenclature} onValueChange={(v: any) => setBatchConfig({ ...batchConfig, nomenclature: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1A">Piso + Letra (Ej. 1A, 2B)</SelectItem>
                      <SelectItem value="101">Numérico Hotel (Ej. 101, 201)</SelectItem>
                      <SelectItem value="A1">Letra + Piso (Ej. A1, B2)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-sm border-b pb-2 flex justify-between">
                  <span>Vista Previa</span>
                  <Badge variant="secondary">{previewUnits.length} Unidades</Badge>
                </h4>
                <div className="bg-slate-50 border rounded-md p-2 h-[200px] overflow-y-auto text-sm space-y-1">
                  {previewUnits.length === 0 ? (
                    <p className="text-center text-muted-foreground mt-8">Configura los parámetros para ver las unidades generadas.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {previewUnits.map((u, i) => (
                        <div key={i} className="bg-white border rounded px-2 py-1 text-center text-xs shadow-sm">
                          <span className="font-bold block">{u.name}</span>
                          <span className="text-slate-500">Piso {u.floor}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBatchCreateModal(false)}>Cancelar</Button>
              <Button onClick={handleBatchCreate} disabled={isSubmitting || previewUnits.length === 0}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear {previewUnits.length} Unidades
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog >


        {/* Edit Space Modal */}
        < Dialog open={showEditSpaceModal} onOpenChange={setShowEditSpaceModal} >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Espacio</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nombre</Label>
                <Input value={newSpace.name} onChange={e => setNewSpace({ ...newSpace, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Tipo</Label>
                <Select value={newSpace.typeId} onValueChange={val => setNewSpace({ ...newSpace, typeId: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {spaceTypes.filter(t => t.isActive).map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Piso</Label>
                <Select value={newSpace.floor} onValueChange={v => setNewSpace({ ...newSpace, floor: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecciona un piso" /></SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    <SelectItem value="Subsuelo">Subsuelo</SelectItem>
                    <SelectItem value="PB">Planta Baja</SelectItem>
                    {Array.from({ length: 40 }, (_, i) => i + 1).map(num => (
                      <SelectItem key={num} value={num.toString()}>{`Piso ${num}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Descripción</Label>
                <Input value={newSpace.description} onChange={e => setNewSpace({ ...newSpace, description: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditSpaceModal(false)}>Cancelar</Button>
              <Button onClick={handleUpdateSpace} disabled={isSubmitting}>Guardar Cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog >

        {/* Delete Confirmation Modal */}
        < AlertDialog open={showDeleteConfirmModal} onOpenChange={setShowDeleteConfirmModal} >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente el espacio <strong>{spaceToDelete?.name}</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDeleteSpace}>Eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog >

        {/* Manage Types Modal */}
        < Dialog open={showManageTypesModal} onOpenChange={setShowManageTypesModal} >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Gestionar Tipos de Espacio</DialogTitle>
              <DialogDescription>Crea y configura los tipos de espacios disponibles en tu edificio.</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
              {/* List */}
              <div className="md:col-span-2 border rounded-md overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b text-xs font-medium text-muted-foreground uppercase">Tipos Existentes</div>
                <div className="divide-y max-h-[300px] overflow-y-auto">
                  {spaceTypes.map(type => (
                    <div key={type.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {type.name}
                          {!type.isActive && <Badge variant="secondary" className="text-[10px]">Inactivo</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                          {type.isReservable && <span className="text-green-600 bg-green-50 px-1 rounded">Reservable</span>}
                          {type.isAssignable && <span className="text-blue-600 bg-blue-50 px-1 rounded">Asignable</span>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEditType(type)}><Edit className="h-3.5 w-3.5" /></Button>
                        {type.name !== 'Unidad' && (
                          <Switch checked={type.isActive} onCheckedChange={() => handleToggleTypeStatus(type)} className="scale-75" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form */}
              <div className="bg-slate-50 p-4 rounded-md border h-fit">
                <h4 className="font-medium text-sm mb-3">{typeToEdit ? 'Editar Tipo' : 'Nuevo Tipo'}</h4>
                <div className="space-y-3">
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Nombre</Label>
                    <Input className="h-8" value={newSpaceType.name} onChange={e => setNewSpaceType({ ...newSpaceType, name: e.target.value })} placeholder="Ej. Quincho" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Descripción</Label>
                    <Input className="h-8" value={newSpaceType.description} onChange={e => setNewSpaceType({ ...newSpaceType, description: e.target.value })} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs cursor-pointer" htmlFor="res">Reservable</Label>
                    <Switch id="res" checked={newSpaceType.isReservable} onCheckedChange={c => setNewSpaceType({ ...newSpaceType, isReservable: c })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs cursor-pointer" htmlFor="asn">Asignable a Prop.</Label>
                    <Switch id="asn" checked={newSpaceType.isAssignable} onCheckedChange={c => setNewSpaceType({ ...newSpaceType, isAssignable: c })} />
                  </div>

                  <div className="pt-2 flex gap-2">
                    {typeToEdit && <Button size="sm" variant="ghost" className="flex-1" onClick={cancelEditType}>Cancelar</Button>}
                    <Button size="sm" className="flex-1" onClick={typeToEdit ? handleUpdateType : handleCreateType} disabled={isSubmitting}>
                      {typeToEdit ? 'Guardar' : 'Crear'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => setShowManageTypesModal(false)}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog >
      </Tabs >
    </div >
  );
}
