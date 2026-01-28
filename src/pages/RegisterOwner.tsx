import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LandingNavbar from '@/components/Layout/LandingNavbar';
import LandingFooter from '@/components/Layout/LandingFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { supabase } from '@/lib/supabase';


interface VerificationData {
  isValid: boolean;
  firstName: string;
  lastName: string;
  unitNumber: string;
  email: string;
  isResident: boolean;
  role: string;
}

export default function RegisterOwner() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [countryCode, setCountryCode] = useState('+54');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    phone: '',
    recoveryEmail: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    async function verify() {
      try {
        const { data, error } = await supabase.functions.invoke('accept-invitation', {
          body: { token, checkOnly: true }
        });

        if (error) throw error;

        if (data.isValid) {
          setVerificationData(data);
          // Pre-fill email if available
          setFormData(prev => ({ ...prev, recoveryEmail: data.email || '' }));
        } else {
          setError('El link de invitación ha expirado o no es válido');
        }
      } catch (err) {
        setError('Error al verificar la invitación');
      } finally {
        setLoading(false);
      }
    }

    if (token) verify();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (formData.password !== formData.confirmPassword) {
      setFormError('Las contraseñas no coinciden');
      return;
    }

    // Format final phone number with country code
    // Remove default country code if user typed it, otherwise prepend selected code
    let finalPhone = formData.phone.trim();
    if (!finalPhone.startsWith('+')) {
      finalPhone = `${countryCode} ${finalPhone}`;
    }

    try {
      const { data, error } = await supabase.functions.invoke('accept-invitation', {
        body: {
          token,
          firstName: formData.firstName,
          lastName: formData.lastName,
          dni: formData.dni,
          phone: finalPhone,
          recoveryEmail: formData.recoveryEmail,
          password: formData.password,
        }
      });

      if (error) {
        let errorMessage = 'Error al completar el registro';
        try {
          // Attempt to parse the actual error content returned by the function
          const errorBody = await error.context?.json();
          if (errorBody && errorBody.error) {
            errorMessage = errorBody.error;
          } else if (error.message) {
            errorMessage = error.message;
          }
        } catch (e) {
          errorMessage = error.message || errorMessage;
        }
        throw new Error(errorMessage);
      }

      if (data && (data.userId || data.user?.id)) {
        // Registro exitoso, redirigir al login
        navigate('/login', {
          state: {
            message: '¡Registro completado! Ya puedes iniciar sesión.',
            email: formData.recoveryEmail || data.user?.email || verificationData?.email,
          },
        });
      } else {
        throw new Error('No se pudo completar el registro.');
      }

    } catch (err) {
      // Mostrar el error en el formulario
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
      <div className="font-sans antialiased bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col min-h-screen">
        <LandingNavbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <LandingFooter />
      </div>
    );
  }

  if (error || !verificationData) {
    return (
      <div className="font-sans antialiased bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col min-h-screen">
        <LandingNavbar />
        <div className="flex-grow flex items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-md bg-white shadow-lg border-red-200">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
        <LandingFooter />
      </div>
    );
  }

  return (
    <div className="font-sans antialiased bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col min-h-screen">
      <LandingNavbar />

      <div className="flex-grow flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-[600px] bg-white shadow-2xl rounded-2xl p-8 sm:p-12 border-0">
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-slate-900 text-white p-1.5 rounded-md">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 12L12 22L22 12L12 2Z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">ConsorcioHub</span>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-3 text-center">
              Registro de {verificationData.role === 'OWNER' ? (verificationData.isResident ? 'Propietario y Residente' : 'Propietario') : 'Residente'}
            </h1>
            <p className="text-center text-slate-500 text-[15px] leading-relaxed max-w-sm mx-auto">
              Completa tus datos para activar tu cuenta de la unidad <strong>{verificationData.unitNumber}</strong>.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {formError && (
              <Alert variant="destructive">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {/* Información personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Información personal</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Juan"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Pérez"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dni">DNI</Label>
                  <Input
                    id="dni"
                    name="dni"
                    value={formData.dni}
                    onChange={handleChange}
                    placeholder="12345678"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">WhatsApp</Label>
                  <div className="flex gap-2">
                    <select
                      className="flex h-10 w-24 items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                    >
                      <option value="+54">🇦🇷 +54</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+34">🇪🇸 +34</option>
                      <option value="+52">🇲🇽 +52</option>
                      <option value="+55">🇧🇷 +55</option>
                      <option value="+56">🇨🇱 +56</option>
                      <option value="+57">🇨🇴 +57</option>
                      <option value="+51">🇵🇪 +51</option>
                      <option value="+504">🇭🇳 +504</option>
                      <option value="+598">🇺🇾 +598</option>
                      <option value="+595">🇵🇾 +595</option>
                    </select>
                    <Input
                      id="phone"
                      name="phone"
                      className="flex-1"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9 11 1234 5678"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recoveryEmail">Correo electrónico</Label>
                <Input
                  id="recoveryEmail"
                  name="recoveryEmail"
                  type="email"
                  value={formData.recoveryEmail}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  required
                  disabled
                  className="bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Seguridad</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 text-base font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40">
              Registrar Cuenta
            </Button>
          </form>
        </Card>
      </div>

      <LandingFooter />
    </div>
  );
}
