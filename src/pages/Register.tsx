import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import LandingNavbar from '@/components/Layout/LandingNavbar';
import LandingFooter from '@/components/Layout/LandingFooter';
import RegisterAdminForm from '@/components/Auth/RegisterAdminForm';
import { Card } from "@/components/ui/card";

const Register = () => {
  const location = useLocation();
  const selectedPlan = location.state?.selectedPlan;

  // Si no hay plan seleccionado, redirigir a la landing
  if (!selectedPlan) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="font-sans antialiased bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col min-h-screen">
      <LandingNavbar />

      <div className="flex-grow flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-[600px] bg-white shadow-2xl rounded-2xl p-8 sm:p-12 border-0">
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-slate-900 text-white p-1.5 rounded-md">
                {/* Logo Icon based on screenshot */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 12L12 22L22 12L12 2Z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">ConsorcioHub</span>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-3 text-center">Registro de Administrador</h1>
            <p className="text-center text-slate-500 text-[15px] leading-relaxed max-w-sm mx-auto">
              Cree una cuenta para comenzar a gestionar sus edificios y consorcios.
            </p>
          </div>

          <RegisterAdminForm selectedPlan={selectedPlan} />

        </Card>
      </div>

      <LandingFooter />
    </div>
  );
};

export default Register;
