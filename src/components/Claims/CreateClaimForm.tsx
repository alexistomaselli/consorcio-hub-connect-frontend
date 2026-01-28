import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { ClaimLocation, ClaimPriority } from '@/types/claim';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from 'sonner';
import { Loader2, Upload, X, Image as ImageIcon, Building as BuildingIcon, MapPin } from 'lucide-react';
import { SpaceSelectWithSearch } from './SpaceSelectWithSearch';
import { uploadFiles } from '@/lib/storage';

const formSchema = z.object({
  buildingId: z.string().optional(),
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  priority: z.nativeEnum(ClaimPriority).default(ClaimPriority.NORMAL),
  isSpaceRelated: z.boolean().default(false),
  spaceId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const priorities = [
  { value: ClaimPriority.LOW, label: 'Baja', color: 'bg-blue-100 text-blue-800' },
  { value: ClaimPriority.NORMAL, label: 'Normal', color: 'bg-gray-100 text-gray-800' },
  { value: ClaimPriority.HIGH, label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: ClaimPriority.URGENT, label: 'Urgente', color: 'bg-red-100 text-red-800' },
];

interface CreateClaimFormProps {
  buildingId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateClaimForm({ buildingId: propBuildingId, onSuccess, onCancel }: CreateClaimFormProps) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [loadingSpaces, setLoadingSpaces] = useState(false);

  // Buildings specific logic (mainly for Owners who can select building)
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loadingBuildings, setLoadingBuildings] = useState(false);

  // Image handling
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      buildingId: propBuildingId || '',
      title: '',
      description: '',
      priority: ClaimPriority.NORMAL,
      isSpaceRelated: false,
    },
  });

  const selectedBuildingId = form.watch('buildingId');
  const isSpaceRelated = form.watch('isSpaceRelated');

  // 1. Fetch buildings (if owner and not provided via props)
  useEffect(() => {
    if (propBuildingId) {
      form.setValue('buildingId', propBuildingId);
      return; // If provided via props (e.g. from context dashboard), use it
    }

    // Only needed if user is owner and needs to select which building to claim on
    // Or logic to auto-select if user belongs to only one building
    const fetchUserBuildings = async () => {
      if (!currentUser) return;

      setLoadingBuildings(true);
      try {
        // If user is admin, they usually come with a propBuildingId or we could fetch all
        // But for regular users (OWNER/RESIDENT), we find buildings where they have units
        if (currentUser.role !== 'BUILDING_ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
          const { data: units, error } = await supabase
            .from('units')
            .select('building:buildings(id, name)')
            .or(`ownerId.eq.${currentUser.id},tenantId.eq.${currentUser.id}`);

          if (error) throw error;

          const uniqueBuildings = new Map();
          units?.forEach((u: any) => {
            if (u.building) uniqueBuildings.set(u.building.id, u.building);
          });

          // Also check if the user has a buildingId in their metadata/profile
          if (currentUser.buildingId && !uniqueBuildings.has(currentUser.buildingId)) {
            const { data: b } = await supabase
              .from('buildings')
              .select('id, name')
              .eq('id', currentUser.buildingId)
              .single();
            if (b) uniqueBuildings.set(b.id, b);
          }

          const buildingsList = Array.from(uniqueBuildings.values());
          setBuildings(buildingsList);

          // Auto select if only one
          if (buildingsList.length === 1 && !form.getValues('buildingId')) {
            form.setValue('buildingId', buildingsList[0].id);
          }
        } else if (currentUser.buildingId) {
          // If admin, they usually have one building assigned in metadata
          form.setValue('buildingId', currentUser.buildingId);
          setBuildings([{ id: currentUser.buildingId, name: currentUser.buildingName || 'Mi Edificio' }]);
        }
      } catch (err) {
        console.error('Error fetching buildings', err);
      } finally {
        setLoadingBuildings(false);
      }
    };

    fetchUserBuildings();
  }, [currentUser, propBuildingId, form]);


  // 2. Fetch Spaces (if isSpaceRelated changes)
  useEffect(() => {
    const fetchSpaces = async () => {
      const bId = selectedBuildingId || propBuildingId || currentUser?.buildingId;

      if (!isSpaceRelated || !bId || !currentUser) {
        setSpaces([]);
        return;
      }

      setLoadingSpaces(true);
      try {
        const isAdmin = currentUser.role === 'BUILDING_ADMIN' || currentUser.role === 'SUPER_ADMIN';

        // 1. Fetch units
        let unitsQuery = supabase
          .from('units')
          .select('*, type:space_types(*)')
          .eq('buildingId', bId);

        // If not admin, restrict to user's units
        if (!isAdmin) {
          unitsQuery = unitsQuery.or(`ownerId.eq.${currentUser.id},tenantId.eq.${currentUser.id}`);
        }

        // Parallel fetch for Units and Common Spaces
        const [unitsResponse, spacesResponse] = await Promise.all([
          unitsQuery,

          // 2. Fetch all spaces for the building to identify common areas
          supabase
            .from('spaces')
            .select('*, type:space_types(*)')
            .eq('buildingId', bId)
            .order('name')
        ]);

        if (unitsResponse.error) throw unitsResponse.error;
        if (spacesResponse.error) throw spacesResponse.error;

        // Map units to match the "Space" interface expected by the selector
        const myUnits = (unitsResponse.data || []).map(unit => ({
          id: unit.id,
          name: `Unidad ${unit.number}`,
          floor: unit.floor,
          type: unit.type || { name: 'Unidad Funcional' }, // Fallback if relationship is null
          isUnit: true,
          unitId: unit.id
        }));

        // Filter common spaces: those in the 'spaces' table that are NOT units
        const commonSpaces = (spacesResponse.data || [])
          .filter(space => {
            const typeName = space.type?.name?.toLowerCase() || '';
            return typeName !== 'unidad';
          })
          .map(space => ({
            ...space,
            isUnit: false,
            unitId: null,
            type: space.type || { name: 'Espacio Común' } // Fallback
          }));

        // Combine them: My Units + All Common Areas
        const combinedSpaces = [...myUnits, ...commonSpaces];
        setSpaces(combinedSpaces);

      } catch (error) {
        console.error("Error fetching spaces:", error);
        toast.error("Error al cargar espacios");
      } finally {
        setLoadingSpaces(false);
      }
    };

    fetchSpaces();
  }, [isSpaceRelated, selectedBuildingId, propBuildingId, currentUser]);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);

      // Create previews
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      // Revoke old url to avoid memory leak
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const onSubmit = async (data: FormValues) => {
    const bId = selectedBuildingId || propBuildingId || currentUser?.buildingId;
    if (!bId || !currentUser) {
      toast.error('Falta información del edificio o usuario');
      return;
    }

    setLoading(true);
    let uploadedImageUrls: string[] = [];

    // 1. Upload Images (Real Upload to Bucket)
    if (selectedFiles.length > 0) {
      setUploadingImages(true);
      try {
        uploadedImageUrls = await uploadFiles('claims', `claim-evidence/${bId}`, selectedFiles);
      } catch (uploadError) {
        console.error('Error uploading images:', uploadError);
        toast.error('Error al subir imágenes. El reclamo se creará sin ellas.');
      } finally {
        setUploadingImages(false);
      }
    }

    try {
      // 2. Prepare Insert Data
      const selectedSpace = data.isSpaceRelated && data.spaceId
        ? spaces.find(s => s.id === data.spaceId)
        : null;

      const claimData = {
        title: data.title,
        description: data.description,
        status: 'PENDING', // Default status
        priority: data.priority,
        buildingId: bId,
        creatorId: currentUser.id,
        // Optional relations
        spaceId: (data.isSpaceRelated && selectedSpace && !selectedSpace.isUnit) ? data.spaceId : null,
        unitId: (data.isSpaceRelated && selectedSpace && selectedSpace.isUnit) ? selectedSpace.unitId : null,
        location: data.isSpaceRelated
          ? (selectedSpace
            ? (selectedSpace.isUnit ? ClaimLocation.UNIT : ClaimLocation.COMMON_AREA)
            : ClaimLocation.BUILDING)
          : ClaimLocation.BUILDING,
        images: uploadedImageUrls // empty for now
      };

      console.log('Creating claim:', claimData);

      const { error } = await supabase
        .from('claims')
        .insert(claimData);

      if (error) throw error;

      toast.success('Reclamo creado correctamente');
      onSuccess?.();

      // Reset form
      form.reset();
      setSelectedFiles([]);
      setPreviewUrls([]);

    } catch (error: any) {
      console.error('Error creating claim:', error);
      toast.error(`Error al crear reclamo: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl">Nuevo Reclamo</CardTitle>
        <CardDescription>
          Reporta un incidente o solicita mantenimiento para tu unidad o espacios comunes.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            {/* Building Selection (Only if multiple available/Owner) */}
            {(!propBuildingId && buildings.length > 1) && (
              <FormField
                control={form.control}
                name="buildingId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Edificio</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un edificio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {buildings.map((b) => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Título del incidente</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Pérdida de agua en cocina" {...field} />
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
                          <SelectValue placeholder="Selecciona prioridad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorities.map((p) => (
                          <SelectItem key={p.value} value={p.value} className="cursor-pointer">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${p.color.split(' ')[0].replace('bg-', 'bg-')}`}></span>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción detallada</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe el problema con el mayor detalle posible..."
                      className="min-h-[100px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location Switch */}
            <div className="bg-slate-50 p-4 rounded-lg border">
              <FormField
                control={form.control}
                name="isSpaceRelated"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-y-0">
                    <div className="space-y-1">
                      <FormLabel className="text-base font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        Ubicación específica
                      </FormLabel>
                      <FormDescription>
                        ¿El problema es en un espacio específico (SUM, Gimnasio, Unidad)?
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

              {isSpaceRelated && (
                <div className="mt-4 pt-4 border-t">
                  <FormField
                    control={form.control}
                    name="spaceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seleccionar Espacio</FormLabel>
                        <FormControl>
                          <SpaceSelectWithSearch
                            spaces={spaces}
                            value={field.value}
                            onChange={field.onChange}
                            disabled={loadingSpaces}
                            placeholder={loadingSpaces ? "Cargando espacios..." : "Buscar espacio..."}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {/* Image Upload Area */}
            <div className="space-y-2">
              <FormLabel>Evidencia (Fotos)</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-md overflow-hidden border bg-gray-50 group">
                    <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {previewUrls.length < 4 && (
                  <div className="aspect-square rounded-md border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors bg-gray-50 flex flex-col items-center justify-center cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleImageChange}
                    />
                    <div className="flex flex-col items-center text-center p-2 text-muted-foreground">
                      <Upload className="h-8 w-8 mb-2 opacity-50" />
                      <span className="text-xs">Subir fotos</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                  Cancelar
                </Button>
              )}
              <Button type="submit" disabled={loading} className="min-w-[150px]">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Crear Reclamo'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
