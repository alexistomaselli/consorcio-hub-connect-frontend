import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { PlusCircle, Home, Search, Edit, UserPlus, Trash2, Eye, Loader2, Grid, LayoutGrid } from 'lucide-react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import SpacesSetupWizard from '@/components/Spaces/SpacesSetupWizard';
import BuildingView from '@/components/Spaces/BuildingView';
import { Switch } from '@/components/ui/switch';
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

// Definición de tipos para las respuestas de la API
interface SpaceTablesResponse {
  error?: boolean;
  message?: string;
  setup_required?: boolean;
}

// Definición de tipos

interface Space {
  id: string;
  name: string;
  type: {
    id: string;
    name: string;
    description?: string;
    isReservable: boolean;
    isAssignable: boolean;
  };
  floor?: string;
  description?: string;
  owners?: {
    id: string;
    firstName: string;
    lastName: string;
    isMain: boolean;
  }[];
}

interface SpaceType {
  id: string;
  name: string;
  description?: string;
  isReservable: boolean;
  isAssignable: boolean;
}

export default function Spaces() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spaceTypes, setSpaceTypes] = useState<SpaceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [tablesExist, setTablesExist] = useState<boolean | null>(null);
  
  // Estado para el diálogo de confirmación de desvinculación
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [ownerToRemove, setOwnerToRemove] = useState<{spaceId: string, ownerId: string, isMain: boolean} | null>(null);
  const [isConfiguringTables, setIsConfiguringTables] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'building'>('building');
  
  // Estados para los modales
  const [showAddSpaceModal, setShowAddSpaceModal] = useState(false);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [showAddOwnerModal, setShowAddOwnerModal] = useState(false);
  const [currentSpaceForOwner, setCurrentSpaceForOwner] = useState<Space | null>(null);
  const [owners, setOwners] = useState<{ id: string; firstName: string; lastName: string; email: string }[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState('');
  const [isMainOwner, setIsMainOwner] = useState(false);
  const [loadingOwners, setLoadingOwners] = useState(false);
  const [assigningOwner, setAssigningOwner] = useState(false);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [showEditSpaceModal, setShowEditSpaceModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [spaceToEdit, setSpaceToEdit] = useState<Space | null>(null);
  const [spaceToDelete, setSpaceToDelete] = useState<Space | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showGenerateUnitsModal, setShowGenerateUnitsModal] = useState(false);
  
  // Estados para la gestión de tipos de espacios
  const [showManageTypesModal, setShowManageTypesModal] = useState(false);
  const [typeToEdit, setTypeToEdit] = useState<SpaceType | null>(null);
  const [typeToDelete, setTypeToDelete] = useState<SpaceType | null>(null);
  const [showDeleteTypeConfirmModal, setShowDeleteTypeConfirmModal] = useState(false);
  const [isDeletingType, setIsDeletingType] = useState(false);
  
  // Estado para el formulario de nuevo espacio
  const [newSpace, setNewSpace] = useState({
    name: '',
    typeId: '',
    floor: '',
    description: ''
  });
  const [isSubmittingSpace, setIsSubmittingSpace] = useState(false);
  
  // Estados para el formulario de tipo de espacio
  const [newSpaceType, setNewSpaceType] = useState({
    name: '',
    description: '',
    isReservable: false,
    isAssignable: false
  });
  const [typeFormErrors, setTypeFormErrors] = useState<{name?: string}>({});
  const [isSubmittingType, setIsSubmittingType] = useState(false);

  // Verificar si las tablas de espacios existen
  const checkSpaceTablesExist = async () => {
    if (!user?.buildingId) return;
    
    try {
      console.log(`Verificando existencia de tablas para building: ${user.buildingId}`);
      
      // Intentar con retries y timeouts ajustados para reducir errores en consola
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos de timeout
      
      const response = await api.get<SpaceTablesResponse>(
        `/buildings/${user.buildingId}/spaces/check-tables`,
        { 
          // @ts-ignore - signal está disponible pero TypeScript no lo reconoce correctamente
          signal: controller.signal,
          timeout: 8000
        }
      ).catch(e => {
        console.warn('Error al verificar tablas:', e.message || e.code || e.name);
        
        // En caso de errores de conexión, asumir que las tablas existen para evitar mostrar el botón
        if (e.name === 'AbortError' || 
            e.code === 'ECONNABORTED' || 
            e.code === 'ETIMEDOUT' || 
            e.message?.includes('timeout') ||
            e.message?.includes('Network Error')) {
          // Asumir que las tablas existen en caso de errores de conexión
          return { data: { setup_required: false } };
        }
        
        // Para otros tipos de errores, reenviamos el error
        throw e;
      });
      
      clearTimeout(timeoutId);
      
      // Si se requiere configuración, mostrar el botón para configurar
      if (response.data.setup_required) {
        console.log('Se requiere configuración de tablas de espacios');
        setTablesExist(false);
      } else {
        console.log('Tablas de espacios ya existen, cargando datos...');
        setTablesExist(true);
        // Cargar datos solo si las tablas existen
        await fetchRealData();
      }
    } catch (error) {
      // Si hay un error no relacionado con la conexión, asumimos que las tablas ya existen
      // Esto evita mostrar el botón de configuración cuando no podemos determinar con certeza
      console.warn('Error al verificar tablas, asumiendo que existen');
      setTablesExist(true);
      await fetchRealData();
    }
  };

  // Función para configurar las tablas de espacios
  const configureTables = async () => {
    if (!user?.buildingId) return;
    
    setIsConfiguringTables(true);
    
    try {
      await api.post(`/buildings/${user.buildingId}/spaces/setup-tables`);
      toast({
        title: 'Éxito',
        description: 'Tablas configuradas correctamente. Ahora configuremos los tipos de espacios.'
      });
      // Actualizar el estado y mostrar el wizard
      setTablesExist(true);
      setShowSetupWizard(true); // Mostrar automáticamente el wizard
    } catch (error) {
      console.error('Error al configurar tablas:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron configurar las tablas',
        variant: 'destructive'
      });
    } finally {
      setIsConfiguringTables(false);
    }
  };

  // Función que se ejecuta cuando el wizard completa la configuración
  const handleSetupComplete = async () => {
    setShowSetupWizard(false);
    setTablesExist(true);
    await fetchRealData();
  };

  // Función para cargar datos reales de la API con manejo de errores silencioso
  const fetchRealData = async () => {
    if (!user?.buildingId) return;
    
    setIsLoading(true);
    
    try {
      // Configuración común para las llamadas a la API con cancelación automática
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout
      
      const axiosConfig = {
        signal: controller.signal,
        headers: { 'Cache-Control': 'no-cache' }
      };
      
      // Cargar tipos de espacios con manejo de errores silencioso
      let typesData: SpaceType[] = [];
      try {
        const typesResponse = await api.get<SpaceType[]>(
          `/buildings/${user.buildingId}/spaces/types`, 
          axiosConfig
        ).catch(e => {
          if (e.name === 'AbortError' || e.code === 'ECONNABORTED') {
            return { data: [] as SpaceType[] };
          }
          throw e;
        });
        
        clearTimeout(timeoutId);
        typesData = typesResponse.data;
        setSpaceTypes(typesData);
      } catch (typeError) {
        // Error silencioso
      }
      
      // Cargar espacios con sus tipos
      try {
        const spacesResponse = await api.get<Space[]>(
          `/buildings/${user.buildingId}/spaces`,
          axiosConfig
        ).catch(e => {
          if (e.name === 'AbortError' || e.code === 'ECONNABORTED') {
            return { data: [] as Space[] };
          }
          throw e;
        });
        
        console.log('Datos de espacios recibidos:', spacesResponse.data);
        console.log('Total de espacios:', spacesResponse.data.length);
        
        // Verificar si hay unidades según los criterios de BuildingView
        const units = spacesResponse.data.filter(space => 
          space.type.name === 'Unidad' || 
          space.name.match(/^[0-9]+$/) || // números solos
          space.name.match(/^[A-Z]?[0-9]+$/)); // letra opcional seguida de números
        
        console.log('Unidades detectadas para vista de edificio:', units.length);
        if (units.length === 0) {
          console.log('No se detectaron unidades para la vista de edificio');
        } else {
          console.log('Unidades:', units);
        }
        
        setSpaces(spacesResponse.data);
      } catch (spacesError) {
        // Error silencioso
      }
      
      // Si no se pudo cargar nada, usar datos simulados en desarrollo
      if (typesData.length === 0 && process.env.NODE_ENV === 'development') {
        loadMockData();
      }
    } catch (error) {
      // Fallback para desarrollo
      if (process.env.NODE_ENV === 'development') {
        loadMockData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Función para abrir el modal de edición de espacios
  const handleEditSpace = (space: Space) => {
    setSpaceToEdit(space);
    setShowEditSpaceModal(true);
  };

  // Función para guardar los cambios de un espacio editado
  const handleSaveEditedSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaceToEdit || !user?.buildingId) return;
    
    // Validación
    if (!spaceToEdit.name.trim() || !spaceToEdit.type.id) {
      toast({
        title: 'Error',
        description: 'El nombre y tipo son obligatorios',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmittingSpace(true);
    
    try {
      // Estructura de datos para la API
      const spaceData = {
        name: spaceToEdit.name,
        typeId: spaceToEdit.type.id,
        floor: spaceToEdit.floor || '',
        description: spaceToEdit.description || ''
      };
      
      // Actualizar el espacio
      await api.patch(`/buildings/${user.buildingId}/spaces/${spaceToEdit.id}`, spaceData);
      
      toast({
        title: 'Éxito',
        description: 'Espacio actualizado correctamente'
      });
      
      // Cerrar el modal y actualizar la lista
      setShowEditSpaceModal(false);
      setSpaceToEdit(null);
      await fetchRealData();
    } catch (error) {
      console.error('Error al actualizar espacio:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el espacio',
        variant: 'destructive'
      });
    } finally {
      setIsSubmittingSpace(false);
    }
  };

  // Función para abrir el modal de confirmación de eliminación
  const handleDeleteSpace = (space: Space) => {
    setSpaceToDelete(space);
    setShowDeleteConfirmModal(true);
  };

  // Función para eliminar un espacio
  const confirmDeleteSpace = async () => {
    if (!spaceToDelete || !user?.buildingId) return;
    
    setIsDeleting(true);
    
    try {
      // Eliminar el espacio - manejamos la respuesta independientemente del status HTTP
      try {
        // Intentar eliminar el espacio con gestión adecuada de la respuesta
        const response = await api.delete(`/buildings/${user.buildingId}/spaces/${spaceToDelete.id}`);
        console.log('Respuesta de eliminación:', response.data);
        
        // Considerar exitoso incluso si devuelve un objeto con campo success
        toast({
          title: 'Éxito',
          description: 'Espacio eliminado correctamente'
        });
        
        // Cerrar el modal y actualizar la lista
        setShowDeleteConfirmModal(false);
        setSpaceToDelete(null);
        await fetchRealData();
      } catch (apiError: any) {
        // Verificar si realmente hubo un error o si solo es un formato de respuesta inesperado
        if (apiError.response?.data?.success === true) {
          // La operación fue exitosa a pesar del error HTTP
          console.log('Operación exitosa a pesar del error HTTP:', apiError.response.data);
          
          toast({
            title: 'Éxito',
            description: 'Espacio eliminado correctamente'
          });
          
          // Cerrar el modal y actualizar la lista
          setShowDeleteConfirmModal(false);
          setSpaceToDelete(null);
          await fetchRealData();
          return;
        }
        
        // Si llegamos aquí, es un error genuino
        throw apiError;
      }
    } catch (error: any) {
      // El mensaje de error puede estar en diferentes lugares según el tipo de error
      const errorMessage = error.response?.data?.message || error.message || 'No se pudo eliminar el espacio';
      
      console.error('Error al eliminar espacio:', error);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Función para abrir el modal de edición de tipo de espacio
  const handleEditSpaceType = (type: SpaceType) => {
    setTypeToEdit(type);
    setNewSpaceType({
      name: type.name,
      description: type.description || '',
      isReservable: type.isReservable,
      isAssignable: type.isAssignable
    });
    setShowManageTypesModal(false); // Cerrar el modal de administración
    setShowAddTypeModal(true); // Abrir el modal de edición
  };

  // Función para actualizar un tipo de espacio
  const handleUpdateSpaceType = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!typeToEdit || !user?.buildingId) return;
    
    // Validación
    if (!newSpaceType.name.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre es obligatorio',
        variant: 'destructive'
      });
      return;
    }
    
    // Logs para depuración
    console.log('Actualizando tipo de espacio:', {
      buildingId: user.buildingId,
      spaceTypeId: typeToEdit.id, // Usando spaceTypeId en lugar de typeId para mayor claridad
      data: newSpaceType
    });
    
    setIsSubmittingType(true);
    
    // Actualizar el tipo de espacio en la base de datos real
    
    // Si no estamos en modo simulación, continuar con la llamada real a la API
    Promise.resolve(
      api.patch<SpaceType>(
        `/buildings/${user.buildingId}/spaces/types/${typeToEdit.id}`,
        JSON.stringify(newSpaceType),
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    )
      .then((response) => {
        // Actualizar el tipo en el state local
        const updatedTypes = spaceTypes.map(type => 
          type.id === typeToEdit?.id ? response.data : type
        );
        setSpaceTypes(updatedTypes);
        
        toast({
          title: 'Éxito',
          description: 'Tipo de espacio actualizado correctamente'
        });
        
        // Cerrar el modal y actualizar la lista
        setShowAddTypeModal(false);
        setTypeToEdit(null);
        
        // Recargar datos para asegurar que tenemos la versión más actualizada
        fetchRealData();
        
        // Resetear formulario
        setNewSpaceType({
          name: '',
          description: '',
          isReservable: false,
          isAssignable: false
        });
        
        // Resetear el estado
        setIsSubmittingType(false);
      })
      .catch((error) => {
        console.error('Error al actualizar tipo de espacio:', error);
        // Mostrar más detalles del error para mejor diagnóstico
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message || 
                            'Error desconocido';
        console.log('Detalles del error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: errorMessage,
          data: error.response?.data
        });
        
        toast({
          title: 'Error',
          description: `No se pudo actualizar el tipo de espacio: ${errorMessage}`,
          variant: 'destructive'
        });
        setIsSubmittingType(false);
      });
  };

  // Función para abrir el modal de confirmación de eliminación de tipo
  const handleDeleteSpaceType = (type: SpaceType) => {
    setTypeToDelete(type);
    setShowDeleteTypeConfirmModal(true);
  };

  // Función para eliminar un tipo de espacio
  const confirmDeleteSpaceType = () => {
    if (!typeToDelete || !user?.buildingId) return;
    
    setIsDeletingType(true);
    
    // Eliminar el tipo de espacio usando Promise.resolve para mejor manejo
    Promise.resolve(
      api.delete(`/buildings/${user.buildingId}/spaces/types/${typeToDelete.id}`)
    )
      .then(() => {
        // Eliminar el tipo del state local
        setSpaceTypes(spaceTypes.filter(type => type.id !== typeToDelete.id));
        
        toast({
          title: 'Éxito',
          description: 'Tipo de espacio eliminado correctamente'
        });
        
        // Cerrar el modal y actualizar la lista
        setShowDeleteTypeConfirmModal(false);
        setTypeToDelete(null);
        
        // Recargar datos para asegurar que tenemos la versión más actualizada
        fetchRealData();
        
        // Resetear el estado
        setIsDeletingType(false);
      })
      .catch((error) => {
        console.error('Error al eliminar tipo de espacio:', error);
        
        // Verificar si es el error específico de espacios asociados
        let errorMessage = 'No se pudo eliminar el tipo de espacio';
        if (error.response?.data?.message?.includes('espacios asociados')) {
          errorMessage = 'No se puede eliminar porque tiene espacios asociados';
        }
        
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
        
        setIsDeletingType(false);
      });
  };

  // Función para cargar datos simulados - versión limpia con manejo de errores
  const loadMockData = () => {
    try {
      console.log('Cargando datos simulados...');
      
      // Datos ficticios para tipos de espacios
      const mockSpaceTypes: SpaceType[] = [
        { 
          id: '1', 
          name: 'Área común', 
          description: 'Espacios de uso común para todos los residentes',
          isReservable: true,
          isAssignable: false
        },
        { 
          id: '2', 
          name: 'Estacionamiento', 
          description: 'Espacios para aparcar vehículos',
          isReservable: false,
          isAssignable: true
        },
        { 
          id: '3', 
          name: 'Salón de eventos', 
          description: 'Espacios para eventos y reuniones',
          isReservable: true,
          isAssignable: false
        }
      ];
      
      // Datos ficticios para espacios
      const mockSpaces: Space[] = [
        {
          id: '1',
          name: 'SUM',
          type: { 
            id: mockSpaceTypes[2].id,
            name: mockSpaceTypes[2].name,
            description: mockSpaceTypes[2].description,
            isReservable: mockSpaceTypes[2].isReservable,
            isAssignable: mockSpaceTypes[2].isAssignable
          },
          floor: 'PB',
          description: 'Salón de usos múltiples con capacidad para 50 personas',
          owners: [
            { id: '1', firstName: 'Admin', lastName: 'Building', isMain: true }
          ]
        },
        {
          id: '2',
          name: 'Estacionamiento A1',
          type: { 
            id: mockSpaceTypes[1].id,
            name: mockSpaceTypes[1].name,
            description: mockSpaceTypes[1].description,
            isReservable: mockSpaceTypes[1].isReservable,
            isAssignable: mockSpaceTypes[1].isAssignable
          },
          floor: 'S1',
          description: 'Estacionamiento cubierto',
          owners: [
            { id: '2', firstName: 'Juan', lastName: 'Pérez', isMain: true }
          ]
        },
        {
          id: '3',
          name: 'Terraza',
          type: { 
            id: mockSpaceTypes[0].id,
            name: mockSpaceTypes[0].name,
            description: mockSpaceTypes[0].description,
            isReservable: mockSpaceTypes[0].isReservable,
            isAssignable: mockSpaceTypes[0].isAssignable
          },
          floor: '10',
          description: 'Terraza con parrilla y zona de estar',
          owners: []
        }
      ];
      
      // Actualizar el estado con los datos simulados
      setSpaceTypes(mockSpaceTypes);
      setSpaces(mockSpaces);
      
      console.log('Datos simulados cargados exitosamente');
    } catch (error) {
      console.warn('Error al cargar datos simulados, usando datos básicos');
      // Intentar con datos mínimos en caso de error
      const basicType: SpaceType = { 
        id: '1', 
        name: 'Tipo de espacio básico', 
        description: '', 
        isReservable: false, 
        isAssignable: false 
      };
      
      setSpaceTypes([basicType]);
      setSpaces([{ 
        id: '1', 
        name: 'Espacio básico', 
        type: { 
          id: basicType.id, 
          name: basicType.name, 
          description: basicType.description,
          isReservable: basicType.isReservable, 
          isAssignable: basicType.isAssignable 
        }, 
        floor: '',
        description: '',
        owners: []
      }]);
    }
  };
  
  // Cargar datos al montar el componente
  useEffect(() => {
    checkSpaceTablesExist();
  }, [user?.buildingId]);

  // Filtrado de espacios por búsqueda y tipo
  const filteredSpaces = spaces.filter(space => {
    const matchesSearch = 
      space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      space.floor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      space.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      space.type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (space.owners?.some(owner => 
        `${owner.firstName} ${owner.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    
    const matchesType = selectedType === 'all' || space.type.id === selectedType;
    
    return matchesSearch && matchesType;
  });
  
  // Función para mostrar el diálogo de confirmación de desvinculación
  const handleRemoveOwner = (spaceId: string, ownerId: string, isMain: boolean) => {
    setOwnerToRemove({ spaceId, ownerId, isMain });
    setShowRemoveDialog(true);
  };
  
  // Función para confirmar la desvinculación del propietario
  const confirmRemoveOwner = async () => {
    if (!user?.buildingId || !ownerToRemove) return;
    
    try {
      await api.delete(
        `/buildings/${user.buildingId}/spaces/${ownerToRemove.spaceId}/owners/${ownerToRemove.ownerId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      // Actualizar el estado local
      setSpaces(prevSpaces => {
        return prevSpaces.map(space => {
          if (space.id === ownerToRemove.spaceId) {
            return {
              ...space,
              owners: space.owners?.filter(owner => owner.id !== ownerToRemove.ownerId)
            };
          }
          return space;
        });
      });
      
      toast({
        title: "Propietario desvinculado",
        description: "El propietario ha sido desvinculado correctamente del espacio.",
      });
      
      // Cerrar el diálogo
      setShowRemoveDialog(false);
      setOwnerToRemove(null);
    } catch (error: any) {
      console.error('Error al desvincular propietario:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo desvincular al propietario del espacio.",
        variant: "destructive"
      });
      setShowRemoveDialog(false);
      setOwnerToRemove(null);
    }
  };
  
  // Función para abrir el modal de asignación de propietario
  const handleAssignOwner = (spaceId: string) => {
    setSelectedSpaceId(spaceId);
    setCurrentSpaceForOwner(spaces.find(space => space.id === spaceId) || null);
    setSelectedOwnerId('');
    setIsMainOwner(false);
    setShowAddOwnerModal(true);
    loadOwners();
  };
  
  // Función para cargar los propietarios disponibles
  const loadOwners = async () => {
    if (!user?.buildingId) return;
    
    setLoadingOwners(true);
    
    try {
      console.log('Cargando propietarios para el edificio:', user.buildingId);
      const response = await api.get(`/owners/buildings/${user.buildingId}`);
      console.log('Respuesta completa:', response);
      console.log('Datos de propietarios recibidos:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Verificar si hay propietarios en la respuesta
        if (response.data.length > 0) {
          console.log('Primer propietario:', response.data[0]);
          setOwners(response.data.map(owner => ({
            id: owner.id,
            firstName: owner.firstName || '',
            lastName: owner.lastName || '',
            email: owner.email || ''
          })));
        } else {
          console.log('No se encontraron propietarios para este edificio');
          setOwners([]);
        }
      } else {
        console.error('La respuesta no tiene el formato esperado:', response.data);
        setOwners([]);
      }
    } catch (error) {
      console.error('Error al cargar propietarios:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los propietarios',
        variant: 'destructive'
      });
    } finally {
      setLoadingOwners(false);
    }
  };
  
  // Función para asignar un propietario a un espacio
  const handleSaveOwnerAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.buildingId || !currentSpaceForOwner || !selectedOwnerId) {
      toast({
        title: 'Error',
        description: 'Datos incompletos para asignar propietario',
        variant: 'destructive'
      });
      return;
    }
    
    setAssigningOwner(true);
    
    try {
      console.log('Intentando asignar propietario:', {
        buildingId: user.buildingId,
        spaceId: currentSpaceForOwner.id,
        ownerId: selectedOwnerId,
        isMain: isMainOwner
      });
      
      const response = await api.post(`/buildings/${user.buildingId}/spaces/${currentSpaceForOwner.id}/owners`, {
        ownerId: selectedOwnerId,
        isMain: isMainOwner
      });
      
      console.log('Respuesta exitosa:', response.data);
      
      toast({
        title: 'Éxito',
        description: 'Propietario asignado correctamente',
      });
      
      // Recargamos los espacios para ver los cambios
      fetchRealData();
      setShowAddOwnerModal(false);
    } catch (error: any) {
      console.error('Error al asignar propietario:', error);
      console.error('Detalles del error:', {
        mensaje: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      
      let errorMessage = 'No se pudo asignar el propietario';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setAssigningOwner(false);
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'building' : 'list');
  };

  // Renderizado del componente
  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Espacios</h1>
        {tablesExist === false ? (
          <div></div>
        ) : (
          <div className="flex space-x-2">
            <div className="flex items-center mr-4 space-x-2 border rounded-md px-3 py-1.5">
              <LayoutGrid 
                className={`h-4 w-4 cursor-pointer ${viewMode === 'building' ? 'text-primary' : 'text-gray-400'}`} 
                onClick={() => setViewMode('building')} 
              />
              <Switch 
                checked={viewMode === 'list'}
                onCheckedChange={toggleViewMode}
              />
              <Grid 
                className={`h-4 w-4 cursor-pointer ${viewMode === 'list' ? 'text-primary' : 'text-gray-400'}`} 
                onClick={() => setViewMode('list')} 
              />
            </div>
            <Button 
              onClick={() => setShowAddSpaceModal(true)} 
              variant="default"
              className="space-x-2"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Nuevo espacio</span>
            </Button>
            <Button 
              onClick={() => setShowManageTypesModal(true)} 
              variant="outline"
              className="space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Tipos de espacios</span>
            </Button>
          </div>
        )}
      </div>

      {tablesExist === false && !isConfiguringTables && (
      <div className="bg-amber-50 border border-amber-200 rounded-md p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Configuración inicial requerida</h2>
        <p className="mb-4">Es necesario configurar las tablas de espacios antes de comenzar.</p>
        <Button onClick={configureTables} disabled={isConfiguringTables}>
          {isConfiguringTables ? (
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
    
    {tablesExist && (
      <div className="space-y-4">
        {/* Buscador y filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar espacios..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {spaceTypes.map(type => (
                <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Spaces display section */}
        {filteredSpaces.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              No se encontraron espacios {searchTerm && 'con los filtros aplicados'}
            </p>
            <Button
              variant="link"
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
              }}
              className="mt-2"
            >
              Limpiar filtros
            </Button>
          </div>
        ) : viewMode === 'building' ? (
          <div className="mt-4">
            <BuildingView 
              spaces={filteredSpaces} 
              onEditSpace={handleEditSpace} 
              onDeleteSpace={handleDeleteSpace} 
              onAssignOwner={handleAssignOwner}
              onRemoveOwner={handleRemoveOwner}
            />
          </div>
        ) : (
          <div className="rounded-md border mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Piso</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSpaces.map(space => (
                  <TableRow key={space.id}>
                    <TableCell className="font-medium">{space.name}</TableCell>
                    <TableCell>{space.type.name}</TableCell>
                    <TableCell>{space.floor || '-'}</TableCell>
                    <TableCell>{space.description || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {space.type.isAssignable && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Asignar propietario"
                            onClick={() => {
                              // Implementar función para asignar propietario
                              console.log('Asignar propietario a:', space);
                            }}
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditSpace(space)}
                          title="Editar espacio"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSpace(space)}
                          title="Eliminar espacio"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    )}
  
  
  {/* Modales para crear/editar espacios y tipos */}
  <Dialog open={showAddSpaceModal} onOpenChange={setShowAddSpaceModal}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Crear nuevo espacio</DialogTitle>
        <DialogDescription>
          Ingresa los detalles del nuevo espacio
        </DialogDescription>
      </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            
            // Validaciones
            if (!newSpace.name.trim()) {
              toast({
                title: 'Error',
                description: 'El nombre es obligatorio',
                variant: 'destructive'
              });
              return;
            }
            
            if (!newSpace.typeId) {
              toast({
                title: 'Error',
                description: 'Debes seleccionar un tipo de espacio',
                variant: 'destructive'
              });
              return;
            }
            
            setIsSubmittingSpace(true);
            
            // Verificar que tenemos buildingId
            if (!user?.buildingId) {
              toast({
                title: 'Error',
                description: 'No se pudo identificar el edificio',
                variant: 'destructive'
              });
              setIsSubmittingSpace(false);
              return;
            }
            
            // Datos para crear el espacio
            // IMPORTANTE: El backend espera 'spaceTypeId', no 'typeId'
            const spaceData = {
              name: newSpace.name.trim(),
              spaceTypeId: newSpace.typeId,  // Convertimos typeId del formulario a spaceTypeId que espera el backend
              floor: newSpace.floor?.trim() || '',
              description: newSpace.description?.trim() || ''
            };
            
            // Loguear datos para depuración
            console.log('Datos para crear espacio:', spaceData);
            console.log(`URL: /buildings/${user.buildingId}/spaces`);
            
            // Crear el espacio con axios directamente para mejor manejo de errores
            api.post<Space>(`/buildings/${user.buildingId}/spaces`, spaceData)
              .then((response) => {
                // Loguear la respuesta completa para depuración
                console.log('Respuesta del servidor al crear espacio:', response.data);
                
                // Éxito
                setShowAddSpaceModal(false);
                setNewSpace({
                  name: '',
                  typeId: '',
                  floor: '',
                  description: ''
                });
                
                toast({
                  title: 'Éxito',
                  description: 'Espacio creado correctamente'
                });
                
                // Recargar datos
                fetchRealData();
                
                // Resetear el estado de submitting en caso de éxito
                setIsSubmittingSpace(false);
              })
              .catch((error) => {
                // Loguear detalles del error para mejor diagnóstico
                console.error('Error al crear espacio:', error);
                console.error('Detalles del error:', {
                  status: error.response?.status,
                  statusText: error.response?.statusText,
                  message: error.response?.data?.message || error.message || 'Error desconocido',
                  data: error.response?.data
                });
                
                // Mostrar mensaje de error más detallado si está disponible
                const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
                toast({
                  title: 'Error',
                  description: `No se pudo crear el espacio: ${errorMessage}`,
                  variant: 'destructive'
                });
                
                // Set submitting state to false on error
                setIsSubmittingSpace(false);
              })
              .then(() => {
                // Asegurarnos que siempre se ejecute este bloque al final, similar a finally
                // Pero solo necesitamos hacerlo para el caso de éxito ya que el error ya maneja su propio estado
              });
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="name"
                  value={newSpace.name}
                  onChange={(e) => setNewSpace({
                    ...newSpace,
                    name: e.target.value
                  })}
                  className="col-span-3"
                  placeholder="Ej: Sala de Reuniones"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Tipo
                </Label>
                <Select 
                  value={newSpace.typeId} 
                  onValueChange={(value) => setNewSpace({
                    ...newSpace,
                    typeId: value
                  })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {spaceTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="floor" className="text-right">
                  Piso
                </Label>
                <Input
                  id="floor"
                  value={newSpace.floor}
                  onChange={(e) => setNewSpace({
                    ...newSpace,
                    floor: e.target.value
                  })}
                  className="col-span-3"
                  placeholder="Ej: PB, 1, 2, etc."
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descripción
                </Label>
                <Input
                  id="description"
                  value={newSpace.description}
                  onChange={(e) => setNewSpace({
                    ...newSpace,
                    description: e.target.value
                  })}
                  className="col-span-3"
                  placeholder="Descripción opcional"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddSpaceModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmittingSpace}>
                {isSubmittingSpace ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : 'Crear espacio'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showAddTypeModal} onOpenChange={setShowAddTypeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {typeToEdit ? 'Editar tipo de espacio' : 'Crear nuevo tipo de espacio'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            setTypeFormErrors({});
            
            // Si estamos editando, usar handleUpdateSpaceType
            if (typeToEdit) {
              handleUpdateSpaceType(e);
              return;
            }
            
            // Validación
            if (!newSpaceType.name.trim()) {
              setTypeFormErrors({
                name: 'El nombre es obligatorio'
              });
              return;
            }
            
            e.preventDefault();
            setIsSubmittingType(true);
            
            // Verificar que tenemos buildingId
            if (!user?.buildingId) {
              toast({
                title: 'Error',
                description: 'No se pudo identificar el edificio',
                variant: 'destructive'
              });
              setIsSubmittingType(false);
              return;
            }
            
            // Crear el tipo de espacio
            Promise.resolve(
              api.post<SpaceType>(`/buildings/${user.buildingId}/spaces/types`, newSpaceType)
            )
              .then((response) => {
                // Actualizar la lista de tipos
                setSpaceTypes([...spaceTypes, response.data]);
                
                // Cerrar el modal y limpiar el formulario
                setShowAddTypeModal(false);
                setNewSpaceType({
                  name: '',
                  description: '',
                  isReservable: false,
                  isAssignable: false
                });
                
                toast({
                  title: 'Éxito',
                  description: 'Tipo de espacio creado correctamente'
                });
              })
              .catch((error) => {
                console.error('Error al crear tipo de espacio:', error);
                toast({
                  title: 'Error',
                  description: 'No se pudo crear el tipo de espacio',
                  variant: 'destructive'
                });
              })
              .finally(() => {
                setIsSubmittingType(false);
              });
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="typeName" className="text-right">
                  Nombre
                </Label>
                <div className="col-span-3">
                  <Input
                    id="typeName"
                    value={newSpaceType.name}
                    onChange={(e) => setNewSpaceType({
                      ...newSpaceType,
                      name: e.target.value
                    })}
                    className={typeFormErrors.name ? 'border-red-500' : ''}
                    placeholder="Ej: Sala de Reuniones"
                  />
                  {typeFormErrors.name && (
                    <p className="text-xs text-red-500 mt-1">{typeFormErrors.name}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="typeDescription" className="text-right">
                  Descripción
                </Label>
                <Input
                  id="typeDescription"
                  value={newSpaceType.description}
                  onChange={(e) => setNewSpaceType({
                    ...newSpaceType,
                    description: e.target.value
                  })}
                  className="col-span-3"
                  placeholder="Descripción opcional"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right">
                  Opciones
                </div>
                <div className="col-span-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isReservable"
                      checked={newSpaceType.isReservable}
                      onChange={(e) => setNewSpaceType({
                        ...newSpaceType,
                        isReservable: e.target.checked
                      })}
                      className="rounded"
                    />
                    <Label htmlFor="isReservable" className="cursor-pointer">
                      Es reservable
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isAssignable"
                      checked={newSpaceType.isAssignable}
                      onChange={(e) => setNewSpaceType({
                        ...newSpaceType,
                        isAssignable: e.target.checked
                      })}
                      className="rounded"
                    />
                    <Label htmlFor="isAssignable" className="cursor-pointer">
                      Es asignable
                    </Label>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddTypeModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmittingType}>
                {isSubmittingType ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {typeToEdit ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (typeToEdit ? 'Actualizar' : 'Crear')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showSetupWizard} onOpenChange={setShowSetupWizard}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Configuración de espacios</DialogTitle>
          </DialogHeader>
          
          <SpacesSetupWizard 
            buildingId={user?.buildingId || ''} 
            onComplete={handleSetupComplete}
            open={showSetupWizard}
            onOpenChange={setShowSetupWizard}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={showGenerateUnitsModal} onOpenChange={setShowGenerateUnitsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generar unidades como espacios</DialogTitle>
            <DialogDescription>
              Esta acción creará espacios basados en las unidades existentes en el edificio.
            </DialogDescription>
          </DialogHeader>
          
          {/* Contenido del modal */}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateUnitsModal(false)}>
              Cancelar
            </Button>
            <Button>
              Generar espacios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showEditSpaceModal} onOpenChange={setShowEditSpaceModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar espacio</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSaveEditedSpace}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editName" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="editName"
                  value={spaceToEdit?.name || ''}
                  onChange={(e) => setSpaceToEdit({
                    ...spaceToEdit!,
                    name: e.target.value
                  })}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editFloor" className="text-right">
                  Piso
                </Label>
                <Input
                  id="editFloor"
                  value={spaceToEdit?.floor || ''}
                  onChange={(e) => setSpaceToEdit({
                    ...spaceToEdit!,
                    floor: e.target.value
                  })}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editDescription" className="text-right">
                  Descripción
                </Label>
                <Input
                  id="editDescription"
                  value={spaceToEdit?.description || ''}
                  onChange={(e) => setSpaceToEdit({
                    ...spaceToEdit!,
                    description: e.target.value
                  })}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editType" className="text-right">
                  Tipo
                </Label>
                <Select 
                  value={spaceToEdit?.type.id || ''}
                  onValueChange={(value) => {
                    const selectedType = spaceTypes.find(type => type.id === value);
                    setSpaceToEdit({
                      ...spaceToEdit!,
                      type: {
                        id: value,
                        name: selectedType?.name || '',
                        isReservable: selectedType?.isReservable || false,
                        isAssignable: selectedType?.isAssignable || false
                      }
                    });
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {spaceTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditSpaceModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmittingSpace}>
                {isSubmittingSpace ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showDeleteConfirmModal} onOpenChange={setShowDeleteConfirmModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el espacio "{spaceToDelete?.name}"?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirmModal(false)} type="button">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteSpace} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showManageTypesModal} onOpenChange={setShowManageTypesModal}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Tipos de espacios</DialogTitle>
            <DialogDescription>
              Administra los tipos de espacios disponibles en el edificio
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {spaceTypes.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">
                No hay tipos de espacios definidos aún.
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Nombre</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="w-[120px]">Reservable</TableHead>
                      <TableHead className="w-[120px]">Asignable</TableHead>
                      <TableHead className="w-[100px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {spaceTypes.map(type => (
                      <TableRow key={type.id}>
                        <TableCell className="font-medium">{type.name}</TableCell>
                        <TableCell>{type.description || '-'}</TableCell>
                        <TableCell>{type.isReservable ? 'Sí' : 'No'}</TableCell>
                        <TableCell>{type.isAssignable ? 'Sí' : 'No'}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEditSpaceType(type)}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteSpaceType(type)}
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowManageTypesModal(false)}>
              Cerrar
            </Button>
            <Button onClick={() => {
              setShowManageTypesModal(false);
              setShowAddTypeModal(true);
            }}>
              Crear nuevo tipo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de confirmación de eliminación de tipo */}
      <Dialog open={showDeleteTypeConfirmModal} onOpenChange={setShowDeleteTypeConfirmModal}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el tipo de espacio "{typeToDelete?.name}"?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 mb-4 p-4 bg-red-50 rounded-md text-red-700 text-sm">
            <p>Nota: Si hay espacios asociados a este tipo, no podrá ser eliminado.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteTypeConfirmModal(false)} type="button">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteSpaceType} disabled={isDeletingType}>
              {isDeletingType ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal para asignar propietario a un espacio */}
      <Dialog open={showAddOwnerModal} onOpenChange={setShowAddOwnerModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Asignar Propietario</DialogTitle>
            <DialogDescription>
              {currentSpaceForOwner && (
                <>Asignar propietario a {currentSpaceForOwner.name} ({currentSpaceForOwner.type.name})</>  
              )}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSaveOwnerAssignment} className="space-y-4 mt-4">
            {loadingOwners ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : owners.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No se encontraron propietarios registrados.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerId">Seleccionar propietario</Label>
                  <Select 
                    value={selectedOwnerId}
                    onValueChange={setSelectedOwnerId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar propietario" />
                    </SelectTrigger>
                    <SelectContent>
                      {owners.map(owner => (
                        <SelectItem key={owner.id} value={owner.id}>
                          {owner.firstName} {owner.lastName} ({owner.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="isMain" 
                    checked={isMainOwner}
                    onCheckedChange={setIsMainOwner}
                  />
                  <Label htmlFor="isMain">Propietario principal</Label>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>El propietario principal será el responsable principal de la unidad y recibirá las notificaciones importantes.</p>
                </div>
              </div>
            )}
            
            <DialogFooter className="pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowAddOwnerModal(false)} 
                type="button"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={!selectedOwnerId || assigningOwner || loadingOwners}
              >
                {assigningOwner ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Asignando...
                  </>
                ) : (
                  'Guardar'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de confirmación para desvincular propietario */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar desvinculación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea desvincular este propietario
              {ownerToRemove?.isMain ? ' principal' : ''}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveOwner}>Aceptar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
