import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

const schema = z.object({
  floors: z.string().min(1, 'El número de pisos es requerido'),
  totalUnits: z.string().min(1, 'El número de unidades es requerido'),
  constructionYear: z.string().optional()
});

type FormData = z.infer<typeof schema>;

interface Props {
  defaultValues?: FormData;
  onSubmit?: (data: FormData) => void;
}

export function StepCharacteristics({ defaultValues, onSubmit }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {
      floors: '',
      totalUnits: '',
      constructionYear: ''
    },
    values: defaultValues
  });

  // Manejar cambios en el formulario
  const handleFormChange = () => {
    const values = form.getValues();
    if (values.floors || values.totalUnits || values.constructionYear) {
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
        <h3 className="text-lg font-medium">Características del Edificio</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="floors"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad de Pisos *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Número de pisos"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalUnits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total de Unidades *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Número de unidades"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="constructionYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Año de Construcción (opcional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Año de construcción"
                    {...field}
                  />
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
