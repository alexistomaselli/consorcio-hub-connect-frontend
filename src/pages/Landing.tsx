import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LandingNavbar from '@/components/Layout/LandingNavbar';
import LandingFooter from '@/components/Layout/LandingFooter';

/**
 * Landing Page - ConsorcioHub
 * 
 * Mapped Colors from User Request:
 * primary -> bg-blue-500 (#3B82F6)
 * primary-dark -> bg-blue-600 (#2563eb)
 * secondary -> bg-green-500 (#10b981)
 * background-light -> bg-white
 * background-dark -> bg-slate-900
 * surface-light -> bg-slate-50 (#f8fafc)
 * surface-dark -> bg-slate-800 (#1e293b)
 */

export default function Landing() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const panelPath = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'BUILDING_ADMIN'
    ? "/dashboard"
    : "/my-claims";

  return (
    <div className="font-sans antialiased bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col min-h-screen">

      <LandingNavbar />

      {/* Header / Hero */}
      <header className="relative overflow-hidden pt-16 pb-24 md:pt-32 md:pb-40">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3B82F6 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 bg-emerald-100 dark:bg-emerald-900/20 rounded-full blur-3xl opacity-50"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-300 text-xs font-semibold uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Software de Gestión de Consorcios
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8 leading-tight">
            La administración de su edificio <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600">más simple y moderna</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed">
            Centralice la comunicación, automatice tareas y mejore la experiencia de administradores y residentes. Todo gestionado desde una plataforma intuitiva y conectada a WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!currentUser ? (
              <Link to="/register" state={{ selectedPlan: { name: 'Inicial', price: 0 } }} className="w-full sm:w-auto inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 transform hover:-translate-y-1">
                Comenzar prueba de 14 días
                <span className="material-symbols-outlined ml-2">arrow_forward</span>
              </Link>
            ) : (
              <Link to={panelPath} className="w-full sm:w-auto inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 transform hover:-translate-y-1">
                Ir a mi Panel de Control
                <span className="material-symbols-outlined ml-2">dashboard</span>
              </Link>
            )}
            <a href="#demo" className="w-full sm:w-auto inline-flex items-center justify-center bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-semibold px-8 py-4 rounded-xl text-base border border-slate-200 dark:border-slate-700 transition-colors shadow-sm">
              <span className="material-symbols-outlined mr-2 text-blue-500">play_circle</span>
              Ver demostración
            </a>
          </div>
          <div className="mt-16 flex justify-center items-center gap-8 text-slate-400 dark:text-slate-500 grayscale opacity-70">
            <span className="font-bold text-xl flex items-center gap-2"><span className="material-symbols-outlined">verified_user</span>SafeBuilding</span>
            <span className="font-bold text-xl flex items-center gap-2"><span className="material-symbols-outlined">security</span>SecureProp</span>
            <span className="font-bold text-xl flex items-center gap-2"><span className="material-symbols-outlined">domain</span>CityManage</span>
          </div>
        </div>
      </header>

      {/* Funcionalidades */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800/50" id="funcionalidades">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Todo lo que necesita para administrar</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Herramientas potentes diseñadas específicamente para resolver los problemas diarios de la administración de consorcios.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 dark:border-slate-700 group">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">chat</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Comunicación Directa</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Centralice consultas y reclamos. Envíe comunicados importantes directamente al WhatsApp de los residentes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 dark:border-slate-700 group">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-2xl">payments</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Gestión de Expensas</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Automatice el cálculo, envío y seguimiento de expensas. Facilite el pago online para reducir la morosidad.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 dark:border-slate-700 group">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-2xl">build</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Mantenimiento</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Gestione proveedores, presupuestos y órdenes de trabajo de forma organizada y transparente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Planes */}
      <section className="py-24 bg-white dark:bg-slate-900" id="planes">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Planes flexibles</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Elija el plan que mejor se adapte al tamaño de su administración.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

            {/* Inicial */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:border-blue-300 transition-all shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Inicial</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$0</span>
                <span className="ml-1 text-slate-500">/mes</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">Perfecto para probar la plataforma.</p>
              {!currentUser ? (
                <Link to="/register" state={{ selectedPlan: { name: 'Inicial', price: 0 } }} className="mt-8 block w-full py-3 px-6 border border-slate-300 dark:border-slate-600 rounded-xl text-center text-sm font-medium text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  Empezar Gratis
                </Link>
              ) : (
                <Link to={panelPath} className="mt-8 block w-full py-3 px-6 border border-slate-300 dark:border-slate-600 rounded-xl text-center text-sm font-medium text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  Ir al Panel
                </Link>
              )}
              <ul className="mt-8 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-center"><span className="material-symbols-outlined text-emerald-500 text-lg mr-2">check</span>Hasta 10 unidades</li>
                <li className="flex items-center"><span className="material-symbols-outlined text-emerald-500 text-lg mr-2">check</span>Gestión de reclamos</li>
                <li className="flex items-center"><span className="material-symbols-outlined text-emerald-500 text-lg mr-2">check</span>Panel básico</li>
                <li className="flex items-center"><span className="material-symbols-outlined text-emerald-500 text-lg mr-2">check</span>Soporte por email</li>
              </ul>
            </div>

            {/* Profesional */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border-2 border-blue-500 relative shadow-2xl transform md:-translate-y-4">
              <div className="absolute top-0 right-0 -mt-4 mr-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Recomendado
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Profesional</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$29</span>
                <span className="ml-1 text-slate-500">/mes</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">Para edificios en crecimiento y modernos.</p>
              {!currentUser ? (
                <Link to="/register" state={{ selectedPlan: { name: 'Profesional', price: 29 } }} className="mt-8 block w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 rounded-xl text-center text-sm font-medium text-white transition-colors shadow-lg shadow-blue-500/30">
                  Seleccionar Pro
                </Link>
              ) : (
                <Link to={panelPath} className="mt-8 block w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 rounded-xl text-center text-sm font-medium text-white transition-colors shadow-lg shadow-blue-500/30">
                  Ir al Panel
                </Link>
              )}
              <ul className="mt-8 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-center"><span className="material-symbols-outlined text-emerald-500 text-lg mr-2">check</span>Hasta 50 unidades</li>
                <li className="flex items-center"><span className="material-symbols-outlined text-emerald-500 text-lg mr-2">check</span><strong>Integración con WhatsApp</strong></li>
                <li className="flex items-center"><span className="material-symbols-outlined text-emerald-500 text-lg mr-2">check</span>Reserva de espacios</li>
                <li className="flex items-center"><span className="material-symbols-outlined text-emerald-500 text-lg mr-2">check</span>Reportes avanzados</li>
                <li className="flex items-center"><span className="material-symbols-outlined text-emerald-500 text-lg mr-2">check</span>Soporte prioritario</li>
              </ul>
            </div>

            {/* Empresarial */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:border-blue-300 transition-all shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Empresarial</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$59</span>
                <span className="ml-1 text-slate-500">/mes</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">Gestión integral para grandes complejos.</p>
              {!currentUser ? (
                <Link to="/register" state={{ selectedPlan: { name: 'Empresarial', price: 59 } }} className="mt-8 block w-full py-3 px-6 border border-slate-300 dark:border-slate-600 rounded-xl text-center text-sm font-medium text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  Contactar Ventas
                </Link>
              ) : (
                <Link to={panelPath} className="mt-8 block w-full py-3 px-6 border border-slate-300 dark:border-slate-600 rounded-xl text-center text-sm font-medium text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  Ir al Panel
                </Link>
              )}
              <ul className="mt-8 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-center"><span className="material-symbols-outlined text-emerald-500 text-lg mr-2">check</span>Unidades ilimitadas</li>
                <li className="flex items-center"><span className="material-symbols-outlined text-emerald-500 text-lg mr-2">check</span>Todo lo de Pro</li>
                <li className="flex items-center"><span className="material-symbols-outlined text-emerald-500 text-lg mr-2">check</span>Multi-usuario</li>
                <li className="flex items-center"><span className="material-symbols-outlined text-emerald-500 text-lg mr-2">check</span>API personalizada</li>
                <li className="flex items-center"><span className="material-symbols-outlined text-emerald-500 text-lg mr-2">check</span>Gerente de cuenta dedicado</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full translate-x-1/2 translate-y-1/2"></div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">¿Listo para transformar su consorcio?</h2>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto relative z-10">
              Únase a más de 500 edificios que ya gestionan su comunidad de forma inteligente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              {!currentUser ? (
                <Link to="/register" state={{ selectedPlan: { name: 'Inicial', price: 0 } }} className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 rounded-xl shadow-lg transition-colors">
                  Registrarse Ahora
                </Link>
              ) : (
                <Link to={panelPath} className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 rounded-xl shadow-lg transition-colors">
                  Ir a mi Panel
                </Link>
              )}
              <a href="#contacto" className="bg-blue-700 text-white hover:bg-blue-800 font-bold py-3 px-8 rounded-xl border border-blue-500 transition-colors">
                Agendar Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />

      {/* Floating Action Button */}
      <a className="fixed bottom-6 right-6 bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 z-50 flex items-center justify-center group" href="#">
        <span className="material-symbols-outlined text-3xl">chat</span>
        <span className="absolute right-full mr-3 bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          ¿Consultas? Hablemos
        </span>
      </a>

    </div>
  );
}
