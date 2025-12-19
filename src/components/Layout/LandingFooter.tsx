import React from 'react';

const LandingFooter = () => {
    return (
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8" id="contacto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="bg-blue-600 text-white p-1.5 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-xl">apartment</span>
                            </div>
                            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">ConsorcioHub</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                            Simplificando la gestión de tu edificio con tecnología inteligente, dashboard intuitivo y conexión directa vía WhatsApp.
                        </p>
                        <div className="flex gap-4">
                            <a className="text-slate-400 hover:text-blue-500 transition-colors" href="#"><span className="material-symbols-outlined">public</span></a>
                            <a className="text-slate-400 hover:text-blue-500 transition-colors" href="#"><span className="material-symbols-outlined">mail</span></a>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-6">Plataforma</h4>
                        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                            <li><a className="hover:text-blue-500 transition-colors" href="#">Para Administradores</a></li>
                            <li><a className="hover:text-blue-500 transition-colors" href="#">Para Residentes</a></li>
                            <li><a className="hover:text-blue-500 transition-colors" href="#">Precios</a></li>
                            <li><a className="hover:text-blue-500 transition-colors" href="#">Integraciones</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-6">Compañía</h4>
                        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                            <li><a className="hover:text-blue-500 transition-colors" href="#">Sobre Nosotros</a></li>
                            <li><a className="hover:text-blue-500 transition-colors" href="#">Blog</a></li>
                            <li><a className="hover:text-blue-500 transition-colors" href="#">Carreras</a></li>
                            <li><a className="hover:text-blue-500 transition-colors" href="#">Contacto</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-6">Legal</h4>
                        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                            <li><a className="hover:text-blue-500 transition-colors" href="#">Privacidad</a></li>
                            <li><a className="hover:text-blue-500 transition-colors" href="#">Términos de uso</a></li>
                            <li><a className="hover:text-blue-500 transition-colors" href="#">Cookies</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-xs text-slate-500 text-center md:text-left">
                        © 2025 ConsorcioHub. Todos los derechos reservados.
                    </p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Sistemas Operativos
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default LandingFooter;
