
import React from 'react';
import { Link } from 'react-router-dom';
import RegisterUserForm from '@/components/Auth/RegisterUserForm';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const RegisterUser = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Registro de residente</h1>
          <p className="text-consorcio-gray-600 mt-2">
            Cree una cuenta para comenzar a gestionar sus reclamos
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Complete sus datos</CardTitle>
            <CardDescription>
              Regístrese como residente para reportar y seguir sus reclamos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterUserForm />
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center space-y-2 border-t pt-6">
            <p className="text-sm text-consorcio-gray-500">
              ¿Ya tiene una cuenta?{' '}
              <Link to="/login" className="text-consorcio-blue hover:underline">
                Iniciar sesión
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

export default RegisterUser;
