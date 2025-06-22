import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { Plus, Search, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import ServiceTypeTable from '@/components/Services/ServiceTypeTable';
import ServiceTypeDialog from '@/components/Services/ServiceTypeDialog';
import ServiceProviderTable, { ServiceProvider } from '@/components/Services/ServiceProviderTable';
import ServiceProviderDialog from '@/components/Services/ServiceProviderDialog';

interface ServiceType {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

const Services = () => {
  const { toast } = useToast();
  const { getAuthHeaders } = useAuth();
  const [serviceTypes, setServiceTypes] = React.useState<ServiceType[]>([]);
  const [providers, setProviders] = React.useState<ServiceProvider[]>([]);
  const [loadingTypes, setLoadingTypes] = React.useState(true);
  const [loadingProviders, setLoadingProviders] = React.useState(true);
  const [serviceTypeDialogOpen, setServiceTypeDialogOpen] = React.useState(false);
  const [editingServiceType, setEditingServiceType] = React.useState<ServiceType | null>(null);
  const [providerDialogOpen, setProviderDialogOpen] = React.useState(false);
  const [editingProvider, setEditingProvider] = React.useState<ServiceProvider | null>(null);
  const [serviceTypeSearchTerm, setServiceTypeSearchTerm] = React.useState('');
  const [providerSearchTerm, setProviderSearchTerm] = React.useState('');
  const [selectedServiceTypes, setSelectedServiceTypes] = React.useState<string[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [providerToDelete, setProviderToDelete] = React.useState<ServiceProvider | null>(null);
  const [serviceTypeToDelete, setServiceTypeToDelete] = React.useState<ServiceType | null>(null);
  const serviceTypeSearchTimeout = React.useRef<number>();
  const providerSearchTimeout = React.useRef<number>();

  const fetchServiceTypes = async (search?: string) => {
    try {
      setLoadingTypes(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/providers/service-types${search ? `?search=${encodeURIComponent(search)}` : ''}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Error al cargar los tipos de servicios');
      const data = await response.json();
      setServiceTypes(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los tipos de servicios",
        variant: "destructive",
      });
    } finally {
      setLoadingTypes(false);
    }
  };

  const fetchProviders = async (search?: string, serviceTypeIds?: string[]) => {
    try {
      setLoadingProviders(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('name', search);
      if (serviceTypeIds?.length) {
        serviceTypeIds.forEach(id => queryParams.append('serviceTypeIds', id));
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/providers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar los proveedores');
      }
      
      const data = await response.json();
      // Transformar los datos para que coincidan con la interfaz ServiceProvider
      const transformedProviders = data.providers.map((provider: any) => ({
        id: provider.id,
        name: provider.name,
        description: provider.description,
        email: provider.email,
        phone: provider.phone,
        address: provider.address,
        city: provider.city,
        state: provider.state,
        rating: provider.rating || 0,
        status: provider.status,
        serviceTypes: provider.serviceTypes.map((st: any) => ({
          id: st.serviceType.id,
          name: st.serviceType.name
        }))
      }));
      setProviders(transformedProviders);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los proveedores",
        variant: "destructive",
      });
    } finally {
      setLoadingProviders(false);
    }
  };

  React.useEffect(() => {
    fetchServiceTypes(serviceTypeSearchTerm);
    fetchProviders(providerSearchTerm, selectedServiceTypes);
  }, []);

  const handleCreateServiceType = async (data: { name: string; description: string }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/providers/service-types`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Error al crear el tipo de servicio');
      
      toast({
        title: "Éxito",
        description: "Tipo de servicio creado correctamente",
      });
      
      fetchServiceTypes();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el tipo de servicio",
        variant: "destructive",
      });
    }
  };

  const handleEditServiceType = async (data: { name: string; description: string }) => {
    if (!editingServiceType) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/providers/service-types/${editingServiceType.id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Error al actualizar el tipo de servicio');
      
      toast({
        title: "Éxito",
        description: "Tipo de servicio actualizado correctamente",
      });
      
      fetchServiceTypes();
      setEditingServiceType(null);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el tipo de servicio",
        variant: "destructive",
      });
    }
  };

  const handleDeleteServiceType = async (serviceType: ServiceType) => {
    setServiceTypeToDelete(serviceType);
  };

  const handleDeleteProvider = async (provider: ServiceProvider) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/providers/${provider.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Error al eliminar el proveedor');
      
      toast({
        title: "Éxito",
        description: "Proveedor eliminado correctamente",
      });
      
      // Actualizar la lista de proveedores
      fetchProviders(providerSearchTerm, selectedServiceTypes);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el proveedor",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Servicios</h1>
      </div>

      <Tabs defaultValue="types" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="types">Tipos de Servicios</TabsTrigger>
          <TabsTrigger value="providers">Proveedores</TabsTrigger>
        </TabsList>

        <TabsContent value="types">
          <Card>
            <CardHeader>
              <div>
                <div className="mb-6">
                  <CardTitle>Tipos de Servicios</CardTitle>
                  <CardDescription>
                    Gestiona los tipos de servicios disponibles en la plataforma
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar tipos de servicios..."
                      className="pl-8"
                      value={serviceTypeSearchTerm}
                      onChange={(e) => {
                        setServiceTypeSearchTerm(e.target.value);
                        if (serviceTypeSearchTimeout.current) {
                          clearTimeout(serviceTypeSearchTimeout.current);
                        }
                        serviceTypeSearchTimeout.current = window.setTimeout(() => {
                          fetchServiceTypes(e.target.value);
                        }, 300);
                      }}
                    />
                  </div>
                  <Button onClick={() => {
                    setEditingServiceType(null);
                    setServiceTypeDialogOpen(true);
                  }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Tipo
                  </Button>
                </div>


              </div>
            </CardHeader>
            <CardContent>
              {loadingTypes ? (
                <div className="text-center text-gray-500 py-8">
                  Cargando tipos de servicios...
                </div>
              ) : (
                <ServiceTypeTable
                  serviceTypes={serviceTypes}
                  onEdit={(serviceType) => {
                    setEditingServiceType(serviceType);
                    setServiceTypeDialogOpen(true);
                  }}
                  onDelete={handleDeleteServiceType}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers">
          <Card>
            <CardHeader>
              <div>
                <div className="mb-6">
                  <CardTitle>Proveedores de Servicios</CardTitle>
                  <CardDescription>
                    Gestiona los proveedores de servicios registrados
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar proveedores..."
                      className="pl-8"
                      value={providerSearchTerm}
                      onChange={(e) => {
                        setProviderSearchTerm(e.target.value);
                        if (providerSearchTimeout.current) {
                          clearTimeout(providerSearchTimeout.current);
                        }
                        providerSearchTimeout.current = window.setTimeout(() => {
                          fetchProviders(e.target.value, selectedServiceTypes);
                        }, 300);
                      }}
                    />
                  </div>
                  <div className="w-[300px]">
                    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          Filtrar por tipo de servicio
                          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <Command>
                          <CommandInput placeholder="Buscar tipo de servicio..." />
                          <CommandList>
                            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                            <CommandGroup>
                              {serviceTypes
                                .filter((st) => !selectedServiceTypes.includes(st.id))
                                .map((serviceType) => (
                                  <CommandItem
                                    key={serviceType.id}
                                    onSelect={() => {
                                      const newTypes = selectedServiceTypes.includes(serviceType.id)
                                        ? selectedServiceTypes.filter((id) => id !== serviceType.id)
                                        : [...selectedServiceTypes, serviceType.id];
                                      setSelectedServiceTypes(newTypes);
                                      fetchProviders(providerSearchTerm, newTypes);
                                      setIsPopoverOpen(false); // Cerrar el popover después de seleccionar
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedServiceTypes.includes(serviceType.id)
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {serviceType.name}
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {selectedServiceTypes.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedServiceTypes.map((id) => {
                          const serviceType = serviceTypes.find((st) => st.id === id);
                          if (!serviceType) return null;
                          return (
                            <Badge
                              key={id}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {serviceType.name}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                  const newTypes = selectedServiceTypes.filter((t) => t !== id);
                                  setSelectedServiceTypes(newTypes);
                                  fetchProviders(providerSearchTerm, newTypes);
                                }}
                              />
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <Button onClick={() => {
                    setEditingProvider(null);
                    setProviderDialogOpen(true);
                  }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Proveedor
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingProviders ? (
                <div className="text-center text-gray-500 py-8">
                  Cargando proveedores...
                </div>
              ) : (
                <ServiceProviderTable
                  providers={providers}
                  onEdit={(provider) => {
                    setEditingProvider(provider);
                    setProviderDialogOpen(true);
                  }}
                  onDelete={(provider) => {
                    setProviderToDelete(provider);
                  }}
                  onVerify={async (provider) => {
                    try {
                      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/providers/${provider.id}/verify`, {
                        method: 'POST',
                        headers: getAuthHeaders(),
                      });

                      if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Error al verificar el proveedor');
                      }

                      toast({
                        title: 'Éxito',
                        description: 'Proveedor verificado correctamente',
                      });

                      // Recargar la lista de proveedores
                      fetchProviders(providerSearchTerm);
                    } catch (error) {
                      console.error('Error:', error);
                      toast({
                        title: 'Error',
                        description: 'No se pudo verificar el proveedor',
                        variant: 'destructive',
                      });
                    }
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ServiceTypeDialog
        open={serviceTypeDialogOpen}
        onOpenChange={setServiceTypeDialogOpen}
        onSubmit={editingServiceType ? handleEditServiceType : handleCreateServiceType}
        initialData={editingServiceType || undefined}
        mode={editingServiceType ? 'edit' : 'create'}
      />

      <ServiceProviderDialog
        open={providerDialogOpen}
        onOpenChange={setProviderDialogOpen}
        onSubmit={async (data) => {
          try {
            // Asegurarnos que los datos coincidan con el DTO
            const providerData = {
              name: data.name,
              description: data.description || null,
              email: data.email,
              phone: data.phone,
              address: data.address,
              city: data.city,
              state: data.state,
              serviceTypeIds: data.serviceTypeIds
            };

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/providers${editingProvider ? `/${editingProvider.id}` : ''}`, {
              method: editingProvider ? 'PUT' : 'POST',
              headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(providerData),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || `Error al ${editingProvider ? 'actualizar' : 'crear'} el proveedor`);
            }

            toast({
              title: "Éxito",
              description: `Proveedor ${editingProvider ? 'actualizado' : 'creado'} correctamente`,
            });

            fetchProviders(providerSearchTerm);
          } catch (error) {
            console.error('Error:', error);
            toast({
              title: "Error",
              description: `No se pudo ${editingProvider ? 'actualizar' : 'crear'} el proveedor`,
              variant: "destructive",
            });
          }
        }}
        initialData={editingProvider}
        mode={editingProvider ? 'edit' : 'create'}
        serviceTypes={serviceTypes}
      />

      <AlertDialog open={!!providerToDelete} onOpenChange={(open) => !open && setProviderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el proveedor "{providerToDelete?.name}" y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!providerToDelete) return;
                
                try {
                  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/providers/${providerToDelete.id}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders(),
                  });

                  if (!response.ok) throw new Error('Error al eliminar el proveedor');
                  
                  toast({
                    title: "Éxito",
                    description: "Proveedor eliminado correctamente",
                  });
                  
                  // Actualizar la lista de proveedores
                  fetchProviders(providerSearchTerm, selectedServiceTypes);
                } catch (error) {
                  console.error('Error:', error);
                  toast({
                    title: "Error",
                    description: "No se pudo eliminar el proveedor",
                    variant: "destructive",
                  });
                } finally {
                  setProviderToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!serviceTypeToDelete} onOpenChange={(open) => !open && setServiceTypeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el tipo de servicio "{serviceTypeToDelete?.name}" y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!serviceTypeToDelete) return;
                
                try {
                  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/providers/service-types/${serviceTypeToDelete.id}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders(),
                  });

                  if (!response.ok) throw new Error('Error al eliminar el tipo de servicio');
                  
                  toast({
                    title: "Éxito",
                    description: "Tipo de servicio eliminado correctamente",
                  });
                  
                  // Actualizar la lista de tipos de servicios
                  fetchServiceTypes(serviceTypeSearchTerm);
                  // También actualizar la lista de proveedores ya que pueden estar filtrados por este tipo
                  fetchProviders(providerSearchTerm, selectedServiceTypes);
                } catch (error) {
                  console.error('Error:', error);
                  toast({
                    title: "Error",
                    description: "No se pudo eliminar el tipo de servicio",
                    variant: "destructive",
                  });
                } finally {
                  setServiceTypeToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Services;
