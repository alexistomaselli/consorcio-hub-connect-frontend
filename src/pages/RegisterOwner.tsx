import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

interface VerificationData {
  isValid: boolean;
  firstName: string;
  lastName: string;
  whatsappNumber: string;
  unitNumber: string;
}

export default function RegisterOwner() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    dni: '',
    recoveryEmail: '',
    password: '',
    verifyCode: '',
  });

  useEffect(() => {
    // Verificar el token cuando el componente se monta
    fetch(`/api/owners/verify/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.isValid) {
          setVerificationData(data);
        } else {
          setError('El link de invitación ha expirado o no es válido');
        }
      })
      .catch(() => {
        setError('Error al verificar la invitación');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      const response = await fetch('/api/owners/complete-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al completar el registro');
      }

      // Registro exitoso, redirigir al login
      navigate('/login', {
        state: {
          message: '¡Registro completado! Ya puedes iniciar sesión.',
          email: formData.recoveryEmail,
        },
      });
    } catch (err) {
      // Mostrar el error en el formulario en lugar de reemplazar todo el contenido
      setFormError(err instanceof Error ? err.message : 'Error al completar el registro');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Verificando invitación...</p>
      </div>
    );
  }

  if (error || !verificationData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Completar Registro</h1>
          <p className="text-gray-500">
            Hola {verificationData.firstName}, completa tus datos para finalizar el registro como
            propietario de la unidad {verificationData.unitNumber}.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <Alert variant="destructive">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="dni">DNI</Label>
            <Input
              id="dni"
              name="dni"
              type="text"
              required
              value={formData.dni}
              onChange={handleChange}
              placeholder="Ingresa tu DNI"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recoveryEmail">Email</Label>
            <Input
              id="recoveryEmail"
              name="recoveryEmail"
              type="email"
              required
              value={formData.recoveryEmail}
              onChange={handleChange}
              placeholder="tu@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="verifyCode">Código de Verificación</Label>
            <Input
              id="verifyCode"
              name="verifyCode"
              type="text"
              required
              value={formData.verifyCode}
              onChange={handleChange}
              placeholder="Ingresa el código recibido por WhatsApp"
            />
          </div>

          <Button type="submit" className="w-full">
            Completar Registro
          </Button>
        </form>
      </Card>
    </div>
  );
}
