import { supabase } from '@/lib/supabase';
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from 'lucide-react';
import { PlatformInvitation } from '@/types';
import RegisterInvitedUserForm from '@/components/Auth/RegisterInvitedUserForm';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const RegisterUser = () => {

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(!!token);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<PlatformInvitation | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      if (!token) return;

      try {
        const { data, error: sbError } = await supabase
          .from('platform_invitations')
          .select('*')
          .eq('token', token)
          .eq('status', 'PENDING')
          .single();

        if (sbError || !data) throw new Error('Invalid token');

        if (new Date(data.expiresAt) < new Date()) {
          throw new Error('Invitation expired');
        }

        setInvitation(data as PlatformInvitation);
      } catch (err) {
        setError('El enlace de invitación es inválido o ha expirado.');
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Registro de Residentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Registro restringido</AlertTitle>
              <AlertDescription>
                El registro de residentes y propietarios es solo por invitación.
                Por favor, contacte a la administración de su edificio para solicitar acceso.
              </AlertDescription>
            </Alert>
            <div className="text-center pt-4">
              <Link to="/login" className="text-primary hover:underline">
                Volver al inicio de sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-slate-600">Verificando invitación...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> Error de Invitación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button className="w-full" onClick={() => navigate('/login')}>
              Ir al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Bienvenido a ConsorcioHub</h1>
          <p className="text-slate-600 mt-2">
            Complete su registro para acceder al panel de {invitation?.role === 'OWNER' ? 'propietarios' : 'residentes'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Completar Registro</CardTitle>
            <CardDescription>
              Configure su contraseña para acceder.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invitation && (
              <RegisterInvitedUserForm
                invitation={invitation}
                email={invitation.email}
              />
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <p className="text-sm text-slate-500">
              ¿Ya tiene una cuenta?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};


export default RegisterUser;
