import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

const schema = z.object({
  buildingName: z.string().min(1, 'El nombre del edificio es requerido'),
  address: z.string().min(1, 'La dirección es requerida')
});

type FormData = z.infer<typeof schema>;

interface Props {
  defaultValues?: FormData;
  onSubmit?: (data: FormData) => void;
}

export function StepBasicInfo({ defaultValues = { buildingName: '', address: '' }, onSubmit }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
    values: defaultValues
  });

  // Manejar cambios en el formulario
  const handleFormChange = () => {
    const values = form.getValues();
    if (values.buildingName || values.address) {
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
        <h3 className="text-lg font-medium">Información Básica del Edificio</h3>
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="buildingName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Edificio *</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del edificio" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
        </div>
      </form>
    </Form>
  );
}
