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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LoginFormData {
  identifier: string;
  password: string;
}

const LoginFormNew = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'whatsapp'>('email');

  const form = useForm<LoginFormData>({
    defaultValues: {
      identifier: '',
      password: '',
    },
    resolver: async (values) => {
      const errors: Record<string, { type: string; message: string }> = {};
      
      if (!values.identifier) {
        errors.identifier = {
          type: 'required',
          message: loginMethod === 'email' 
            ? 'El correo electrónico es requerido' 
            : 'El número de WhatsApp es requerido',
        };
      } else if (loginMethod === 'email' && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.identifier)) {
        errors.identifier = {
          type: 'pattern',
          message: 'Correo electrónico inválido',
        };
      } else if (loginMethod === 'whatsapp' && !/^\+?[0-9]{10,15}$/.test(values.identifier)) {
        errors.identifier = {
          type: 'pattern',
          message: 'Número de WhatsApp inválido',
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
      console.log('Iniciando proceso de login con:', { 
        method: loginMethod, 
        identifier: data.identifier 
      });
      setIsSubmitting(true);
      
      // Aquí determinamos qué método de login usar basado en la pestaña activa
      let redirectTo;
      
      if (loginMethod === 'email') {
        redirectTo = await login(data.identifier, data.password);
      } else {
        // Para WhatsApp, podríamos necesitar adaptar la función login o crear una nueva
        redirectTo = await login(data.identifier, data.password, 'whatsapp');
      }
      
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
    <Tabs 
      defaultValue="email" 
      className="w-full" 
      onValueChange={(value) => setLoginMethod(value as 'email' | 'whatsapp')}
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="email">Email</TabsTrigger>
        <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
      </TabsList>
      
      <TabsContent value="email">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="correo@ejemplo.com" 
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
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      {...field} 
                      autoComplete="current-password" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <Link to="/forgot-password" className="text-sm text-consorcio-blue hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>
        </Form>
      </TabsContent>
      
      <TabsContent value="whatsapp">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de WhatsApp</FormLabel>
                  <FormControl>
                    <Input 
                      type="tel" 
                      placeholder="+54XXXXXXXXXX" 
                      {...field} 
                      autoComplete="tel"
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
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      {...field} 
                      autoComplete="current-password" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <Link to="/forgot-password" className="text-sm text-consorcio-blue hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>
        </Form>
      </TabsContent>
    </Tabs>
  );
};

export default LoginFormNew;
