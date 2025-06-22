import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { ServiceProvider } from './ServiceProviderTable';

interface ServiceType {
  id: string;
  name: string;
}

const formSchema = z.object({
  // Campos requeridos
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede tener más de 100 caracteres'),
  // Campo opcional
  description: z.string().optional(),
  email: z.string().email('Email inválido').max(100, 'El email no puede tener más de 100 caracteres'),
  phone: z.string().min(1, 'El teléfono es requerido').max(20, 'El teléfono no puede tener más de 20 caracteres'),
  address: z.string().min(1, 'La dirección es requerida').max(200, 'La dirección no puede tener más de 200 caracteres'),
  city: z.string().min(1, 'La ciudad es requerida').max(100, 'La ciudad no puede tener más de 100 caracteres'),
  state: z.string().min(1, 'La provincia es requerida').max(100, 'La provincia no puede tener más de 100 caracteres'),
  serviceTypeIds: z.array(z.string()).min(1, 'Debe seleccionar al menos un tipo de servicio'),
});

interface ServiceProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  initialData?: ServiceProvider;
  mode: 'create' | 'edit';
  serviceTypes: ServiceType[];
}

const ServiceProviderDialog: React.FC<ServiceProviderDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
  serviceTypes,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      serviceTypeIds: initialData?.serviceTypes.map(st => st.id) || [],
    },
  });

  // Resetear el formulario cuando cambian los datos iniciales
  React.useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description || '',
        email: initialData.email,
        phone: initialData.phone,
        address: initialData.address,
        city: initialData.city,
        state: initialData.state,
        serviceTypeIds: initialData.serviceTypes.map(st => st.id),
      });
    } else {
      form.reset({
        name: '',
        description: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        serviceTypeIds: [],
      });
    }
  }, [initialData, form]);

  const selectedServiceTypes = form.watch('serviceTypeIds');

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nuevo Proveedor' : 'Editar Proveedor'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del proveedor" {...field} />
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
                      placeholder="Descripción de los servicios que ofrece"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono *</FormLabel>
                    <FormControl>
                      <Input placeholder="Teléfono" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección *</FormLabel>
                  <FormControl>
                    <Input placeholder="Dirección" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudad *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ciudad" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provincia *</FormLabel>
                    <FormControl>
                      <Input placeholder="Provincia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="serviceTypeIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipos de Servicio *</FormLabel>
                  <div className="space-y-2">
                    <Select
                      onValueChange={(value) => {
                        if (!field.value.includes(value)) {
                          field.onChange([...field.value, value]);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipos de servicio" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypes
                          .filter((st) => !field.value.includes(st.id))
                          .map((serviceType) => (
                            <SelectItem key={serviceType.id} value={serviceType.id}>
                              {serviceType.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>

                    <div className="flex flex-wrap gap-2">
                      {field.value.map((id) => {
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
                                field.onChange(
                                  field.value.filter((v) => v !== id)
                                );
                              }}
                            />
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {mode === 'create' ? 'Crear' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceProviderDialog;
