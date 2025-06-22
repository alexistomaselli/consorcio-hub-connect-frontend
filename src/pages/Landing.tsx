import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlanSelector } from '@/components/Plans/PlanSelector';
import { Button } from '@/components/ui/button';

export default function Landing() {
  const navigate = useNavigate();

  const handlePlanSelect = (plan: any) => {
    // Redirigir al registro con el plan seleccionado
    navigate('/register', { 
      state: { selectedPlan: plan }
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h1 className="text-5xl font-bold mb-6">
              Gestione su edificio de manera eficiente
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Simplifique la administración de su consorcio con nuestra plataforma integral.
              Gestione reclamos, comunicaciones y más en un solo lugar.
            </p>
            <Button 
              size="lg"
              onClick={() => handlePlanSelect({
                name: 'FREE',
                price: 0,
                description: 'Prueba todas las funcionalidades',
                features: [
                  { text: 'Gestión de reclamos', included: true },
                  { text: 'Panel de administración', included: true },
                  { text: 'Notificaciones básicas', included: true },
                  { text: 'Soporte por email', included: true },
                  { text: '14 días de prueba', included: true },
                ]
              })}
            >
              Comenzar prueba gratis
            </Button>
          </div>
        </div>
      </section>

      {/* Planes Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Planes diseñados para su edificio
            </h2>
            <p className="text-xl text-gray-600">
              Elija el plan que mejor se adapte a sus necesidades
            </p>
          </div>

          <PlanSelector onPlanSelect={handlePlanSelect} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Todo lo que necesita en un solo lugar
            </h2>
            <p className="text-xl text-gray-600">
              Funcionalidades diseñadas para simplificar la gestión de su edificio
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Gestión de Reclamos</h3>
              <p className="text-gray-600">
                Seguimiento y resolución eficiente de reclamos y solicitudes
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Comunicación Efectiva</h3>
              <p className="text-gray-600">
                Mantenga a todos informados con notificaciones y actualizaciones
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Reportes y Estadísticas</h3>
              <p className="text-gray-600">
                Tome decisiones informadas con datos y métricas claras
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
