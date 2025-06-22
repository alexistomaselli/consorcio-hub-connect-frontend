import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const { currentUser, refreshUser, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    // Redirigir si el usuario ya está verificado
    if (currentUser?.emailVerification?.isVerified) {
      navigate('/profile');
      return;
    }

    // Calcular tiempo restante para poder reenviar
    if (currentUser?.emailVerification?.expiresAt) {
      const expiresAt = new Date(currentUser.emailVerification.expiresAt);
      const now = new Date();
      const diff = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);
      if (diff > 0) {
        setTimeLeft(diff);
      }
    }
  }, [currentUser?.emailVerification, navigate]);

  useEffect(() => {
    // Actualizar contador cada segundo
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.email) return;

    try {
      setLoading(true);
      
      const payload = { 
        email: currentUser.email,
        code: code
      };
      
      // No usamos getAuthHeaders para permitir la verificación sin token
      console.log('Sending verification request with:', {
        url: `${import.meta.env.VITE_API_BASE_URL}/auth/verify-email`,
        payload
      });
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/verify-email`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Verification error response:', errorData);
        throw new Error(errorData.message || 'Error al verificar el email');
      }

      const data = await response.json();
      
      // Guardar el nuevo token
      if (data.verified?.access_token) {
        localStorage.setItem('token', data.verified.access_token);
        
        // Actualizar el estado del usuario
        await refreshUser();
        
        toast({
          title: "¡Email verificado!",
          description: "Tu email ha sido verificado correctamente",
        });
        
        // Usar React Router para la navegación
        navigate("/profile");
      } else {
        console.error('No se recibió el token de acceso en la respuesta:', data);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Error al verificar el email. Por favor intenta nuevamente.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al verificar el email",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!currentUser?.email) return;

    try {
      setResendLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUser.email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al reenviar el código");
      }

      const data = await response.json();
      if (data.sent) {
        toast({
          title: "Código reenviado",
          description: "Hemos enviado un nuevo código a tu email",
        });
        // Actualizar contador
        setTimeLeft(30 * 60); // 30 minutos en segundos
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al reenviar el código",
      });
    } finally {
      setResendLoading(false);
    }
  };

  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentUser?.email || !currentUser?.emailVerification) {
    return (
      <div className="flex flex-col items-center pt-24 px-4">
        <div className="w-full max-w-md p-4 space-y-2 bg-muted/50 rounded-lg border">
          <div className="text-center">
            <h2 className="text-lg font-medium text-muted-foreground">
              No hay verificación pendiente
            </h2>
            <p className="text-sm text-muted-foreground/80">
              No se encontró ninguna solicitud de verificación de email activa para tu cuenta.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Verificar Email</h1>
          <p className="text-muted-foreground">
            Hemos enviado un código de verificación a {currentUser.email}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Ingresa el código de verificación"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verificando..." : "Verificar Email"}
          </Button>
        </form>

        <div className="text-center">
          {timeLeft > 0 ? (
            <p className="text-sm text-muted-foreground">
              Podrás solicitar un nuevo código en {formatTimeLeft()}
            </p>
          ) : (
            <Button 
              variant="outline" 
              onClick={handleResend} 
              disabled={resendLoading || timeLeft > 0}
              className="mt-4"
            >
              {resendLoading ? "Enviando..." : "Reenviar código"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
