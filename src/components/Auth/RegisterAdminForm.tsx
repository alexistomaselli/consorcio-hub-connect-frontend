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
    .max(100, 'El nombre del edificio no puede tener más de 100 caracteres'),

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
        buildingName: data.buildingName,
        planName: selectedPlan.name
      };

      const result = await registerAdmin(registerData);

      if (result && result.error) {
        toast({
          title: 'Error de registro',
          description: result.error.message || 'Error desconocido',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: '¡Registro exitoso!',
        description: 'Por favor, revisa tu correo electrónico para confirmar tu cuenta.',
      });

      navigate('/login', {
        state: {
          email: data.email,
          registrationSuccess: true,
          message: '¡Registro exitoso! Te hemos enviado un correo de confirmación. Por favor, revísalo para activar tu cuenta.'
        }
      });
    } catch (error: any) {
      console.error('Error de registro:', error);
      let errorMessage = 'Ocurrió un error al crear su cuenta';

      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.className === 'AuthApiError' || error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.error_description || error?.error?.message) {
        errorMessage = error.error_description || error.error.message;
      }

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        {/* Información personal */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-4">Información personal</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan" {...field} className="bg-slate-50 border-slate-200 focus:bg-white transition-colors h-11" />
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
                  <FormLabel className="text-slate-700 font-medium">Apellido</FormLabel>
                  <FormControl>
                    <Input placeholder="Pérez" {...field} className="bg-slate-50 border-slate-200 focus:bg-white transition-colors h-11" />
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
                <FormLabel className="text-slate-700 font-medium">Correo electrónico</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="nombre@ejemplo.com"
                    {...field}
                    autoComplete="email"
                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Contraseña */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-4 mt-2">Contraseña</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Contraseña</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="********"
                      {...field}
                      autoComplete="new-password"
                      className="bg-slate-50 border-slate-200 focus:bg-white transition-colors h-11"
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
                  <FormLabel className="text-slate-700 font-medium">Confirmar contraseña</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="********"
                      {...field}
                      autoComplete="new-password"
                      className="bg-slate-50 border-slate-200 focus:bg-white transition-colors h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Información del edificio */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-4 mt-2">Información del edificio</h3>

          <FormField
            control={form.control}
            name="buildingName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-medium">Nombre del edificio</FormLabel>
                <FormControl>
                  <Input placeholder="Edificio 1" {...field} className="bg-slate-50 border-slate-200 focus:bg-white transition-colors h-11" />
                </FormControl>
                <div className="text-xs text-slate-500 mt-1">Ingrese el nombre exacto del edificio donde reside (o administra).</div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12 text-[15px] shadow-sm mt-6" disabled={isSubmitting}>
          {isSubmitting ? 'Registrando...' : 'Registrar'}
        </Button>

        <div className="flex flex-col items-center justify-center space-y-3 mt-6 border-t pt-6 bg-slate-50/50 rounded-b-lg -mx-6 px-6 pb-2">
          <p className="text-sm text-slate-600 font-medium">
            ¿Ya tienes una cuenta? <Link to="/login" className="text-blue-600 hover:underline font-bold">Iniciar sesión</Link>
          </p>
          <p className="text-sm text-slate-600 font-medium">
            ¿Administra un edificio? <Link to="/register" className="text-blue-600 hover:underline font-bold">Registrar edificio</Link>
          </p>
        </div>
      </form>
    </Form>
  );
};

export default RegisterAdminForm;
