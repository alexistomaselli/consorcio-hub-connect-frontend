import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  // Si viene de registrarse, mostrar mensaje de "Revisa tu email"
  // Si viene de un link de supabase (hash en URL), Supabase AuthProvider lo manejará y currentUser se actualizará.

  // Podemos detectar si hay un hash en la URL type=signup o recovery
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Si el usuario ya está logueado (verificado por el link), redirigir
  // No redirigir automáticamente simplemente por tener currentUser.
  // Esta página es "Check your email", el usuario debe quedarse aquí.
  // El link del correo lo llevará a otra url (ej: /profile o dashboard) via supabase redirect.
  useEffect(() => {
    // Optional: check query params if we want to confirm verification success, 
    // but for "Just Registered", do nothing.
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md text-center">
        <div className="mb-4 flex justify-center">
          {/* Icono de email enviado */}
          <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Verifica tu correo</h1>
        <p className="text-gray-600">
          Hemos enviado un enlace de confirmación a tu dirección de correo electrónico.
          Por favor, haz clic en el enlace para activar tu cuenta.
        </p>
        <p className="text-sm text-gray-500 mt-4">
          ¿No recibiste el correo? Revisa tu carpeta de spam.
        </p>
        <Button variant="link" onClick={() => navigate('/login')}>
          Volver al inicio de sesión
        </Button>
      </div>
    </div>
  );
};

export default VerifyEmail;
