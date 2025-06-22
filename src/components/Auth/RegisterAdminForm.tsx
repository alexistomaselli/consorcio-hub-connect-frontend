
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { toast } from '@/components/ui/use-toast';

const registerSchema = z.object({
  firstName: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres'),
  lastName: z.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede tener más de 50 caracteres'),
  email: z.string()
    .email('Ingrese un email válido'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(50, 'La contraseña no puede tener más de 50 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe tener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe tener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe tener al menos un número'),
  confirmPassword: z.string(),
  buildingName: z.string()
    .min(3, 'El nombre del edificio debe tener al menos 3 caracteres')
    .max(100, 'El nombre del edificio no puede tener más de 100 caracteres')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

interface Plan {
  name: string;
  price: number;
  description: string;
  features: Array<{ text: string; included: boolean }>;
  popular?: boolean;
  disabled?: boolean;
}

interface RegisterAdminFormProps {
  selectedPlan: Plan;
}

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterAdminForm = ({ selectedPlan }: RegisterAdminFormProps) => {
  const { registerAdmin } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegisterFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      buildingName: '',
    },
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormData) => {
    console.log('Form data:', data);
    console.log('Selected plan:', selectedPlan);
    if (data.password !== data.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const registerData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        building: {
          name: data.buildingName,
          address: '', // Por ahora lo dejamos vacío, se completará en el perfil
          schema: data.buildingName.toLowerCase().replace(/[^a-z0-9]+/g, '_')
        }
      };

      console.log('Sending register data:', registerData);
      const result = await registerAdmin(registerData);
      console.log('Register response:', result);
      
      // Verificar si el resultado contiene un error
      if (typeof result === 'object' && 'error' in result) {
        // Mostrar el mensaje de error
        toast({
          title: 'Error de registro',
          description: result.error,
          variant: 'destructive',
        });
        return; // Terminar la ejecución de la función
      }
      
      // Si llegamos aquí, el registro fue exitoso
      toast({
        title: '¡Bienvenido!',
        description: selectedPlan.name === 'FREE'
          ? 'Su cuenta ha sido creada y su período de prueba ha comenzado'
          : 'Su cuenta ha sido creada exitosamente',
      });
      
      // El token ya debería estar almacenado en localStorage por el AuthContext
      
      // Redirigir a la URL devuelta por registerAdmin
      if (result === '/verify-email') {
        navigate('/verify-email');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Error de registro:', error);
      // Obtener el mensaje de error de diferentes posibles estructuras
      const errorMessage = 
        error.message || 
        error.response?.data?.message || 
        error.error?.message ||
        'Ocurrió un error al crear su cuenta';
      
      toast({
        title: 'Error de registro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido</FormLabel>
                  <FormControl>
                    <Input placeholder="Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="nombre@ejemplo.com"
                    {...field}
                    autoComplete="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="********"
                      {...field}
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar contraseña</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="********"
                      {...field}
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="buildingName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del edificio</FormLabel>
                <FormControl>
                  <Input placeholder="Edificio San Martín" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Registrando...' : 'Comenzar prueba gratis'}
        </Button>

        <div className="text-center mt-4">
          <p className="text-sm text-consorcio-gray-500">
            ¿Ya tiene una cuenta?{' '}
            <Link to="/login" className="text-consorcio-blue hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </form>
    </Form>
  );
};

export default RegisterAdminForm;
