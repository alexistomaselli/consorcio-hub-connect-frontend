import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { ClaimLocation, ClaimPriority } from '@/types/claim';
import { api } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SpaceSelectWithSearch } from './SpaceSelectWithSearch';
import { toast } from '@/components/ui/use-toast';

const formSchema = z.object({
  buildingId: z.string().optional(),
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  unitId: z.string().optional(),
  priority: z.nativeEnum(ClaimPriority).default(ClaimPriority.NORMAL),
  images: z.array(z.string()).default([]),
  isSpaceRelated: z.boolean().default(false),
  spaceTypeId: z.string().optional(),
  spaceId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const priorities = [
  { value: ClaimPriority.LOW, label: 'Baja' },
  { value: ClaimPriority.NORMAL, label: 'Normal' },
  { value: ClaimPriority.HIGH, label: 'Alta' },
  { value: ClaimPriority.URGENT, label: 'Urgente' },
];

interface Building {
  id: string;
  name: string;
  units: Array<{
    id: string;
    number: string;
    floor: string;
  }>;
}

interface SpaceType {
  id: string;
  name: string;
  description?: string;
  isReservable: boolean;
  isAssignable: boolean;
}

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
}

interface CreateClaimFormProps {
  buildingId?: string;
  onSuccess?: () => void;
}

export function CreateClaimForm({ buildingId, onSuccess }: CreateClaimFormProps) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [spaceTypes, setSpaceTypes] = useState<SpaceType[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loadingSpaceTypes, setLoadingSpaceTypes] = useState<boolean>(false);
  const [loadingSpaces, setLoadingSpaces] = useState<boolean>(false);
  const [errorLoadingSpaces, setErrorLoadingSpaces] = useState<string>('');
  
  // Definir el formulario al principio para poder usarlo en los useEffect
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      buildingId: buildingId || currentUser?.buildingId,
      title: '',
      description: '',
      unitId: '',
      priority: ClaimPriority.NORMAL,
      images: [],
      isSpaceRelated: false,
    },
  });

  useEffect(() => {
    const fetchBuildings = async () => {
      if (currentUser?.role !== 'OWNER') return;

      try {
        const { data } = await api.get<Building[]>('/owners/me/buildings');
        setBuildings(data);
      } catch (error) {
        console.error('Error al obtener edificios:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los edificios',
          variant: 'destructive',
        });
      }
    };

    fetchBuildings();
  }, [currentUser]);

  useEffect(() => {
    const isSpaceRelated = form.watch('isSpaceRelated');
    // Para BUILDING_ADMIN usamos el buildingId del usuario
    // Para OWNER debemos usar el buildingId seleccionado en el formulario
    let buildingId;
    
    if (currentUser?.role === 'OWNER') {
      buildingId = form.watch('buildingId'); // Para OWNER siempre usar el del formulario
      console.log(`[CreateClaimForm] Usuario OWNER, buildingId seleccionado: ${buildingId}`);
    } else {
      buildingId = currentUser?.buildingId; // Para otros roles usar el del usuario
      console.log(`[CreateClaimForm] Usuario ${currentUser?.role}, buildingId: ${buildingId}`);
    }

    const getSpacesByUserRole = async (buildingId: string, currentUser: any) => {
      // URL base para API
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const headers = { Authorization: `Bearer ${currentUser?.token}` };

      try {
        // Para usuarios OWNER, usamos el nuevo endpoint específico
        if (currentUser?.role === 'OWNER') {
          console.log('Obteniendo espacios para OWNER usando endpoint específico');

          // Endpoint que devuelve tanto unidades del propietario como espacios comunes
          const endpoint = `${baseUrl}/buildings/${buildingId}/owner-spaces/${currentUser.id}`;

          // Hacemos la petición al endpoint
          const response = await fetch(endpoint, {
            method: 'GET',
            headers
          });

          if (!response.ok) {
            console.error('Error al obtener espacios del propietario:', response.status);
            // Si falla el endpoint específico, volvemos al enfoque anterior
            return await getFallbackOwnerSpaces(buildingId, currentUser);
          }

          const data = await response.json();
          console.log('Espacios filtrados para propietario:', data);
          return data;
        }

        // Para BUILDING_ADMIN u otros roles, obtenemos todos los espacios
        console.log('Obteniendo todos los espacios para BUILDING_ADMIN');
        const { data: allSpaces } = await api.get<Space[]>(`/buildings/${buildingId}/spaces?includeType=true`, { headers });
        return allSpaces;
      } catch (error) {
        console.error('Error al obtener espacios:', error);
        // En caso de error, intentamos con el método alternativo
        return await getFallbackOwnerSpaces(buildingId, currentUser);
      }
    };

    const getFallbackOwnerSpaces = async (buildingId: string, currentUser: any) => {
      console.log('Usando método fallback para obtener espacios filtrados');
      try {
        // 1. Obtenemos todos los espacios del edificio
        const { data: allSpaces } = await api.get<Space[]>(`/buildings/${buildingId}/spaces?includeType=true`, {
          headers: { Authorization: `Bearer ${currentUser?.token}` }
        });

        // 2. Si no es propietario, devolvemos todos los espacios
        if (currentUser?.role !== 'OWNER') {
          return allSpaces;
        }

        // 3. Para propietarios, obtenemos sus unidades
        const { data: ownerUnits } = await api.get(`/owners/${currentUser.id}/units`, {
          headers: { Authorization: `Bearer ${currentUser?.token}` }
        });

        // Creamos un set con los IDs de unidades del propietario
        const ownerUnitIds = new Set<string>();
        if (Array.isArray(ownerUnits)) {
          ownerUnits.forEach((unit: any) => {
            if (unit?.id) ownerUnitIds.add(unit.id);
          });
        }

        // 4. Filtramos: incluir todas las unidades del propietario + todos los espacios comunes
        const filteredSpaces = allSpaces.filter(space => {
          const isUnitSpace = space.type?.name?.toLowerCase() === 'unidad';

          // Si es unidad, solo incluir si pertenece al propietario
          // Si es espacio común, siempre incluir
          return !isUnitSpace || (isUnitSpace && ownerUnitIds.has(space.id));
        });

        return filteredSpaces;
      } catch (error) {
        console.error('Error en método fallback:', error);
        throw error;
      }
    };

    const fetchSpaces = async () => {
      // Solo intentar cargar espacios si:
      // - El reclamo está relacionado con un espacio
      // - El usuario está autenticado
      // - Para OWNER: debe tener un edificio seleccionado
      // - Para otros roles: debe tener buildingId en su perfil
      const selectedBuildingId = form.watch('buildingId');
      const canLoadSpaces = isSpaceRelated && currentUser && 
        (currentUser.role === 'OWNER' ? !!selectedBuildingId : !!currentUser?.buildingId);
      
      if (canLoadSpaces) {
        setLoadingSpaces(true);
        setErrorLoadingSpaces(''); // Resetear errores previos
        
        try {
          // Determinar qué buildingId usar según el rol
          const buildingId = currentUser.role === 'OWNER'
            ? selectedBuildingId
            : currentUser.buildingId;
          
          console.log(`[CreateClaimForm] Cargando espacios para ${currentUser.role} en edificio: ${buildingId}`);
          
          // Obtener espacios según el rol del usuario
          const spaces = await getSpacesByUserRole(buildingId, currentUser);
          setSpaces(spaces);

        } catch (error) {
          console.error('Error al cargar espacios:', error);
          setErrorLoadingSpaces('No se pudieron cargar los espacios');
        } finally {
          setLoadingSpaces(false);
        }
      }
    };

    const fetchSpaceTypes = async () => {
      if (isSpaceRelated) {
        setLoadingSpaceTypes(true);
        try {
          const { data } = await api.get<SpaceType[]>('/space-types');
          setSpaceTypes(data);
        } catch (error) {
          console.error('Error al cargar tipos de espacios:', error);
        } finally {
          setLoadingSpaceTypes(false);
        }
      }
    };

    // Solo intentar cargar espacios y tipos si el reclamo está relacionado con un espacio
    if (isSpaceRelated) {
      // Para OWNER verificamos que tenga un edificio seleccionado
      const selectedBuildingId = form.watch('buildingId');
      if (currentUser?.role === 'OWNER' && !selectedBuildingId) {
        console.log('[CreateClaimForm] OWNER sin edificio seleccionado, esperando selección...');
        setSpaces([]); // Resetear espacios si no hay edificio seleccionado
      } else {
        fetchSpaces();
        fetchSpaceTypes();
      }
    }
  }, [
    form.watch('isSpaceRelated'), 
    form.watch('buildingId'), // Importante: detectar cambios en el edificio seleccionado
    currentUser
  ]);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);

    const buildingId = currentUser?.role === 'OWNER' ? data.buildingId : currentUser?.buildingId;
    if (!buildingId) return;

    const submitData = {
      ...data,
      spaceId: data.isSpaceRelated ? data.spaceId : undefined,
      location: data.isSpaceRelated ? ClaimLocation.COMMON_AREA : ClaimLocation.BUILDING,
      isSpaceRelated: undefined,
      spaceTypeId: undefined,
    };

    try {
      await api.post(`/buildings/${buildingId}/claims`, submitData);

      toast({
        title: 'Éxito',
        description: 'Reclamo creado correctamente',
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error al crear el reclamo:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el reclamo',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {currentUser?.role === 'OWNER' && (
          <FormField
            control={form.control}
            name="buildingId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Edificio</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    const building = buildings.find(b => b.id === value);
                    setSelectedBuilding(building || null);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un edificio" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {buildings.map((building) => (
                      <SelectItem key={building.id} value={building.id}>
                        {building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Título del reclamo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe el problema"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prioridad</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la prioridad" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isSpaceRelated"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Relacionar con espacio</FormLabel>
                <FormDescription>
                  ¿Este reclamo está relacionado con un espacio específico del edificio?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {form.watch('isSpaceRelated') && (
          <FormField
            control={form.control}
            name="spaceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Espacio</FormLabel>
                <FormControl>
                  <SpaceSelectWithSearch
                    spaces={spaces}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={loadingSpaces}
                    placeholder={loadingSpaces ? "Cargando espacios..." : "Selecciona un espacio"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creando...' : 'Crear Reclamo'}
        </Button>
      </form>
    </Form>
  );
}
