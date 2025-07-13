import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlanSelector } from '@/components/Plans/PlanSelector';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const handlePlanSelect = (plan: any) => {
    // Redirigir al registro con el plan seleccionado
    navigate('/register', { 
      state: { selectedPlan: plan }
    });
  };

  return (
    <div className="min-h-screen w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-10 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto mb-8 md:mb-12 lg:mb-16 px-2 sm:px-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight">
              Gestione su edificio de manera eficiente
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto">
              Simplifique la administración de su consorcio con nuestra plataforma integral.
              Gestione reclamos, comunicaciones y más en un solo lugar.
            </p>
            <div className="flex justify-center">
              <Button 
                size="lg"
                className="text-sm sm:text-base px-4 py-2 sm:px-6 flex items-center gap-2 group"
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
                <span>Comenzar prueba gratis</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Planes Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12 px-2 sm:px-0">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
              Planes diseñados para su edificio
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Elija el plan que mejor se adapte a sus necesidades
            </p>
          </div>

          <PlanSelector onPlanSelect={handlePlanSelect} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12 px-2 sm:px-0">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
              Todo lo que necesita en un solo lugar
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Funcionalidades diseñadas para simplificar la gestión de su edificio
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            <div className="text-center p-4 sm:p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Gestión de Reclamos</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Seguimiento y resolución eficiente de reclamos y solicitudes
              </p>
            </div>

            <div className="text-center p-4 sm:p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Comunicación Efectiva</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Mantenga a todos informados con notificaciones y actualizaciones
              </p>
            </div>

            <div className="text-center p-4 sm:p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Reportes y Estadísticas</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Tome decisiones informadas con datos y métricas claras
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-10 sm:py-16 bg-blue-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row">
              <div className="p-6 md:p-8 lg:p-10 md:w-3/5">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">¿Listo para comenzar?</h2>
                <p className="text-gray-600 mb-6">
                  Simplifique la administración de su edificio hoy mismo con nuestra plataforma integral.                  
                </p>
                <div className="flex justify-center sm:justify-start">
                  <Button 
                    className="w-full sm:w-auto flex items-center justify-center gap-2"
                    onClick={() => handlePlanSelect({
                      name: 'FREE',
                      price: 0,
                      description: 'Prueba todas las funcionalidades',
                      features: [
                        { text: 'Gestión de reclamos', included: true },
                        { text: 'Panel de administración', included: true },
                        { text: 'Notificaciones básicas', included: true },
                      ]
                    })}
                  >
                    <span>Registrarse ahora</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-6 md:p-8 lg:p-10 flex items-center justify-center md:w-2/5 text-white overflow-hidden">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Beneficios inmediatos</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Organización mejorada</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Comunicación efectiva</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Gestión simplificada</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
