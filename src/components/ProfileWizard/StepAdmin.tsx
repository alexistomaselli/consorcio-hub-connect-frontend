import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

const schema = z.object({
  adminFirstName: z.string().min(1, 'El nombre es requerido'),
  adminLastName: z.string().min(1, 'El apellido es requerido'),
  adminPhone: z.string().min(1, 'El teléfono es requerido')
});

type FormData = z.infer<typeof schema>;

interface Props {
  defaultValues?: FormData;
  onSubmit?: (data: FormData) => void;
}

export function StepAdmin({ defaultValues, onSubmit }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {
      adminFirstName: '',
      adminLastName: '',
      adminPhone: ''
    },
    values: defaultValues
  });

  // Manejar cambios en el formulario
  const handleFormChange = () => {
    const values = form.getValues();
    if (values.adminFirstName || values.adminLastName || values.adminPhone) {
      onSubmit?.(values);
    }
  };

  // Suscribirse a cambios en el formulario
  useEffect(() => {
    const subscription = form.watch(handleFormChange);
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <Form {...form}>
      <form className="space-y-6">
        <h3 className="text-lg font-medium">Información del Administrador</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="adminFirstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="adminLastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido *</FormLabel>
                <FormControl>
                  <Input placeholder="Apellido" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="adminPhone"
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
      </form>
    </Form>
  );
}
