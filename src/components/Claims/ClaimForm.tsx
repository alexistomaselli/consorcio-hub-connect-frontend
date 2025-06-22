
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useClaims } from '@/context/ClaimsContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { ClaimCategory } from '@/types';

interface ClaimFormData {
  title: string;
  description: string;
  category: ClaimCategory;
  unitId?: string;
}

const ClaimForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { createClaim, loading } = useClaims();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ClaimFormData>({
    defaultValues: {
      title: '',
      description: '',
      category: 'general',
    },
  });

  const onSubmit = async (data: ClaimFormData) => {
    if (!currentUser) {
      toast({
        title: 'Error',
        description: 'Debe iniciar sesión para crear un reclamo',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      await createClaim({
        ...data,
        userId: currentUser.id,
        buildingId: currentUser.buildingId,
      });
      
      form.reset();
      
      toast({
        title: 'Reclamo creado',
        description: 'Su reclamo ha sido enviado con éxito',
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error al crear el reclamo:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al crear el reclamo',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título del reclamo</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Filtración de agua en baño" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="plumbing">Plomería</SelectItem>
                  <SelectItem value="electrical">Electricidad</SelectItem>
                  <SelectItem value="elevator">Ascensor</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="security">Seguridad</SelectItem>
                  <SelectItem value="cleaning">Limpieza</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unitId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unidad (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ej. 5A" {...field} />
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
                  placeholder="Describa detalladamente el problema..."
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Aquí podríamos agregar un campo para subir imágenes */}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Enviar Reclamo'}
        </Button>
      </form>
    </Form>
  );
};

export default ClaimForm;
