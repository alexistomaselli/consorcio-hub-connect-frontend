import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from 'react-hook-form';

interface ServiceTypeFormData {
  name: string;
  description: string;
}

interface ServiceTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ServiceTypeFormData) => void;
  initialData?: {
    name: string;
    description: string;
  };
  mode: 'create' | 'edit';
}

const ServiceTypeDialog: React.FC<ServiceTypeDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode
}) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ServiceTypeFormData>({
    defaultValues: initialData || {
      name: '',
      description: ''
    }
  });

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        reset(initialData);
      }
    } else {
      // Cuando el modal se cierra, reseteamos el formulario
      reset({
        name: '',
        description: ''
      });
    }
  }, [open, initialData, reset]);

  const onSubmitForm = (data: ServiceTypeFormData) => {
    onSubmit(data);
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nuevo Tipo de Servicio' : 'Editar Tipo de Servicio'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Agrega un nuevo tipo de servicio al sistema'
              : 'Modifica los detalles del tipo de servicio'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              {...register('name', { required: 'El nombre es requerido' })}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descripción opcional del tipo de servicio"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Crear' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceTypeDialog;
