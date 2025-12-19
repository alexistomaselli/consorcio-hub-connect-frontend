import React from 'react';
import { Link } from 'react-router-dom';
import LoginFormNew from '@/components/Auth/LoginFormNew';
import { Card } from "@/components/ui/card";
import LandingNavbar from '@/components/Layout/LandingNavbar';
import LandingFooter from '@/components/Layout/LandingFooter';

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50 dark:bg-slate-900">
      <LandingNavbar />

      <div className="flex-grow flex flex-col items-center justify-center py-16 px-4 bg-gradient-to-br from-slate-50 to-slate-200/50 dark:from-slate-900 dark:to-slate-800">
        <Card className="w-full max-w-[480px] bg-white shadow-2xl rounded-2xl p-8 sm:p-10 border-0">
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-slate-900 text-white p-1.5 rounded-md">
                {/* Logo Icon based on screenshot (approx) */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 12L12 22L22 12L12 2Z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">ConsorcioHub</span>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-3 text-center">Bienvenido de nuevo</h1>
            <p className="text-center text-slate-500 text-[15px] leading-relaxed max-w-sm mx-auto">
              Ingresa tus credenciales para gestionar tus consorcios.
            </p>
          </div>

          <LoginFormNew />

          <div className="mt-8 flex flex-col items-center gap-6">
            <div className="w-16 h-1 bg-slate-100 rounded-full"></div>

            <div className="text-sm text-slate-600">
              ¿No tienes una cuenta? <Link to="/register-user" className="text-blue-600 font-semibold hover:underline">Regístrate</Link>
            </div>

            <Link to="/support" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium">
              {/* Using material symbol if available or fallback icon */}
              <span className="material-symbols-outlined text-lg">headset_mic</span>
              ¿Necesitas ayuda?
            </Link>
          </div>
        </Card>
      </div>

      <LandingFooter />
    </div>
  );
};

export default Login;
