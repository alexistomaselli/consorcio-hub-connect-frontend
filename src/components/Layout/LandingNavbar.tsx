import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LandingNavbar = () => {
    const navigate = useNavigate();

    return (
        <>
            {/* Top Banner */}
            <div className="bg-slate-900 text-white text-xs md:text-sm font-medium py-2.5 px-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-20"></div>
                <div className="relative z-10 flex justify-center items-center gap-2">
                    <span>🚀 Nueva funcionalidad: Gestión de reclamos vía WhatsApp</span>
                    <a className="underline hover:text-blue-200 ml-1 transition-colors flex items-center gap-1" href="#">
                        Ver detalles <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </a>
                </div>
            </div>

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-2 rounded-lg shadow-lg shadow-blue-500/20">
                                <span className="material-symbols-outlined text-2xl leading-none">apartment</span>
                            </div>
                            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">ConsorcioHub</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <Link to="/#funcionalidades" className="text-sm font-medium text-slate-600 hover:text-blue-500 dark:text-slate-300 transition-colors">Funcionalidades</Link>
                            <Link to="/#planes" className="text-sm font-medium text-slate-600 hover:text-blue-500 dark:text-slate-300 transition-colors">Planes</Link>
                            <Link to="/#contacto" className="text-sm font-medium text-slate-600 hover:text-blue-500 dark:text-slate-300 transition-colors">Contacto</Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="hidden md:block text-sm font-semibold text-slate-700 hover:text-blue-500 dark:text-slate-200 transition-colors">
                                Ingresar
                            </Link>
                            <Link to="/register" state={{ selectedPlan: { name: 'Inicial', price: 0 } }} className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transform hover:-translate-y-0.5">
                                Prueba Gratis
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default LandingNavbar;
