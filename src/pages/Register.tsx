
import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import RegisterAdminForm from '@/components/Auth/RegisterAdminForm';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Register = () => {
  const location = useLocation();
  const selectedPlan = location.state?.selectedPlan;

  // Si no hay plan seleccionado, redirigir a la landing
  if (!selectedPlan) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Registro de administrador</h1>
          <p className="text-gray-600 mt-2">
            Complete sus datos para comenzar
          </p>
        </div>

        {/* Plan Summary */}
        <div className="mb-8">
          <Alert className="bg-blue-50 border-blue-200">
            <div className="flex items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-blue-800 mb-2">
                  Plan seleccionado: {selectedPlan.name}
                </h3>
                <AlertDescription className="text-blue-700">
                  <ul className="space-y-1">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2" />
                      Prueba gratuita por 14 días
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2" />
                      Acceso a todas las funcionalidades
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2" />
                      Sin compromiso
                    </li>
                  </ul>
                </AlertDescription>
              </div>
              <div className="text-right">
                <Link to="/" className="text-blue-600 hover:underline text-sm">
                  Cambiar plan
                </Link>
              </div>
            </div>
          </Alert>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Complete sus datos</CardTitle>
            <CardDescription>
              La información básica para comenzar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterAdminForm selectedPlan={selectedPlan} />
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center space-y-2 border-t pt-6">
            <p className="text-sm text-gray-500">
              ¿Ya tiene una cuenta?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                Iniciar sesión
              </Link>
            </p>
            <p className="text-sm text-gray-500">
              ¿Es un residente?{' '}
              <Link to="/register-user" className="text-blue-600 hover:underline">
                Registrarse como usuario
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
