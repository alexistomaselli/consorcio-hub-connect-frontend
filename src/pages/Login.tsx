
import React from 'react';
import { Link } from 'react-router-dom';
import LoginFormNew from '@/components/Auth/LoginFormNew';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Login = () => {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Iniciar sesión</h1>
          <p className="text-consorcio-gray-600 mt-2">
            Acceda a su cuenta para gestionar su edificio
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Bienvenido de nuevo</CardTitle>
            <CardDescription>
              Ingrese sus credenciales para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginFormNew />
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center space-y-2 border-t pt-6">
            <p className="text-sm text-consorcio-gray-500">
              ¿Es un residente nuevo?{' '}
              <Link to="/register-user" className="text-consorcio-blue hover:underline">
                Registrarse como usuario
              </Link>
            </p>
            <p className="text-sm text-consorcio-gray-500">
              ¿Administra un edificio?{' '}
              <Link to="/register" className="text-consorcio-blue hover:underline">
                Registrar edificio
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
