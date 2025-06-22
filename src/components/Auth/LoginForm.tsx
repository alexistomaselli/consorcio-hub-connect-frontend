
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
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

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: async (values) => {
      const errors: Record<string, { type: string; message: string }> = {};
      
      if (!values.email) {
        errors.email = {
          type: 'required',
          message: 'El correo electrónico es requerido',
        };
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
        errors.email = {
          type: 'pattern',
          message: 'Correo electrónico inválido',
        };
      }

      if (!values.password) {
        errors.password = {
          type: 'required',
          message: 'La contraseña es requerida',
        };
      } else if (values.password.length < 6) {
        errors.password = {
          type: 'minLength',
          message: 'La contraseña debe tener al menos 6 caracteres',
        };
      }

      return {
        values: Object.keys(errors).length === 0 ? values : {},
        errors,
      };
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log('Iniciando proceso de login con:', { email: data.email });
      setIsSubmitting(true);
      
      const redirectTo = await login(data.email, data.password);
      
      console.log('Login exitoso, redirigiendo a:', redirectTo);
      toast({
        title: 'Inicio de sesión exitoso',
        description: redirectTo === '/settings/building' 
          ? 'Por favor, configure WhatsApp para continuar'
          : 'Bienvenido de nuevo',
      });
      navigate(redirectTo);
    } catch (error: any) {
      console.error('Error detallado de inicio de sesión:', {
        message: error?.message,
        name: error?.name,
        code: error?.code,
        status: error?.status,
      });
      
      toast({
        title: 'Error de inicio de sesión',
        description: error?.message || 'Ocurrió un error al intentar iniciar sesión',
        variant: 'destructive',
      });
      
      // Limpiar el campo de contraseña
      form.setValue('password', '');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Contraseña</FormLabel>
                <Link
                  to="/forgot-password"
                  className="text-sm text-consorcio-blue hover:underline"
                >
                  ¿Olvidó su contraseña?
                </Link>
              </div>
              <FormControl>
                <Input
                  type="password"
                  {...field}
                  autoComplete="current-password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </Button>

        <div className="text-center mt-4">
          <p className="text-sm text-consorcio-gray-500">
            ¿No tiene una cuenta?{' '}
            <Link to="/register" className="text-consorcio-blue hover:underline">
              Registrarse
            </Link>
          </p>
        </div>
      </form>
    </Form>
  );
};

export default LoginForm;