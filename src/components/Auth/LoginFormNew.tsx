import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
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
import { Eye, EyeOff } from 'lucide-react';

interface LoginFormData {
  identifier: string;
  password: string;
  rememberMe?: boolean;
}

const LoginFormNew = () => {
  const { login, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    defaultValues: {
      identifier: '',
      password: '',
      rememberMe: false,
    },
    resolver: async (values) => {
      const errors: Record<string, { type: string; message: string }> = {};

      if (!values.identifier) {
        errors.identifier = {
          type: 'required',
          message: 'El correo electrónico es requerido',
        };
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.identifier)) {
        errors.identifier = {
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

  const location = useLocation();

  React.useEffect(() => {
    if (location.state?.registrationSuccess && location.state?.message) {
      toast({
        title: '¡Cuenta creada!',
        description: location.state.message,
        className: 'bg-green-50 border-green-200 text-green-900',
        duration: 6000,
      });
      if (location.state?.email) {
        form.setValue('identifier', location.state.email);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location, form]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);

      // Defaulting to email login
      const redirectTo = await login(data.identifier, data.password);

      console.log('Login exitoso, redirigiendo a:', redirectTo);
      toast({
        title: 'Inicio de sesión exitoso',
        description: 'Bienvenido de nuevo',
      });
      navigate(redirectTo);
    } catch (error: any) {
      // Handle specific "Email not confirmed" error
      if (error?.message?.includes('Email not confirmed')) {
        toast({
          title: 'Correo no confirmado',
          description: 'Por favor, verifica tu correo electrónico para activar tu cuenta.',
          variant: 'destructive',
          action: (
            <div className="flex flex-col gap-2 w-full">
              <Button
                variant="default"
                size="sm"
                className="w-full bg-white text-red-600 hover:bg-gray-100 border-none"
                onClick={async () => {
                  toast({ title: 'Reenviando...', description: 'Enviando nuevo correo de verificación.' });
                  const { error: resendError } = await resendVerificationEmail(data.identifier);
                  if (resendError) {
                    toast({
                      title: 'Error',
                      description: 'No se pudo reenviar el correo. Intente más tarde.',
                      variant: 'destructive',
                    });
                  } else {
                    toast({
                      title: 'Correo enviado',
                      description: 'Revise su bandeja de entrada (y spam).',
                    });
                  }
                }}
              >
                Reenviar correo
              </Button>
            </div>
          ),
        });
      } else {
        toast({
          title: 'Error de inicio de sesión',
          description: error?.message || 'Credenciales inválidas',
          variant: 'destructive',
        });
      }
      form.setValue('password', '');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700 font-semibold">Correo Electrónico</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="admin@consorciohub.com"
                  className="bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 h-10 px-4"
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
              <FormLabel className="text-slate-700 font-semibold">Contraseña</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 h-10 px-4 pr-10"
                    {...field}
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    </span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between pt-1">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-slate-600 font-medium cursor-pointer">
                    Recordarme
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          <Link
            to="/forgot-password"
            className="text-[13px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 text-[15px] shadow-sm mt-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>
      </form>
    </Form>
  );
};

export default LoginFormNew;
