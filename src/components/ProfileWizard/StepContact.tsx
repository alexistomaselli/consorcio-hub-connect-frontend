import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { WhatsAppInput, validateWhatsApp } from '../ui/whatsapp-input';

const schema = z.object({
  phoneNumber: z.string().min(1, 'El teléfono es requerido'),
  whatsapp: z.string().min(1, 'El WhatsApp es requerido'),
  email: z.string().min(1, 'El email es requerido'),
  website: z.string().optional(),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').optional()
});

type FormData = z.infer<typeof schema>;

interface Props {
  defaultValues?: FormData;
  onSubmit?: (data: FormData) => void;
}

export function StepContact({ defaultValues, onSubmit }: Props) {
  const { currentUser } = useAuth();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {
      phoneNumber: '',
      whatsapp: '',
      email: '',
      website: '',
      description: ''
    },
    values: defaultValues
  });

  // Manejar cambios en el formulario
  const handleFormChange = () => {
    const values = form.getValues();
    if (values.phoneNumber || values.whatsapp || values.email || values.website || values.description) {
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
        <h3 className="text-lg font-medium">Información de Contacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono Fijo *</FormLabel>
                <FormControl>
                  <Input placeholder="Teléfono Fijo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp *</FormLabel>
                <FormControl>
                  <WhatsAppInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sitio Web (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
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
              <FormLabel>Descripción (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descripción del edificio (mínimo 10 caracteres si se completa)"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
