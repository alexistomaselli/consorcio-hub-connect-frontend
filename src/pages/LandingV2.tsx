import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function LandingV2() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="font-display bg-[#f6f7f8] dark:bg-[#101922] text-[#0d141b] dark:text-slate-50 overflow-x-hidden">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-solid border-white dark:border-slate-800 bg-white/80 dark:bg-[#101922]/80 backdrop-blur-md">
                <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="text-[#137fec]">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd"
                                    d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
                                    fill="currentColor" fillRule="evenodd"></path>
                            </svg>
                        </Link>
                        <Link to="/" className="text-xl font-bold tracking-tight">ConsorcioHub</Link>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <Link className="text-sm font-medium hover:text-[#137fec] transition-colors" to="/">Home</Link>

                        <a className="text-sm font-medium hover:text-[#137fec] transition-colors" href="#">Features</a>
                        <a className="text-sm font-medium hover:text-[#137fec] transition-colors" href="#">Pricing</a>
                        <a className="text-sm font-medium hover:text-[#137fec] transition-colors" href="#">About</a>
                    </nav>
                    <div className="flex items-center gap-3">
                        <button className="md:hidden p-2 text-slate-600 dark:text-slate-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
                        </button>
                        <div className="hidden sm:flex items-center gap-3">
                            <Link
                                to="/login"
                                className="hidden sm:flex px-4 py-2 text-sm font-bold bg-[#e7edf3] dark:bg-slate-800 rounded-lg hover:bg-[#d0d9e1] transition-colors items-center justify-center">
                                Login
                            </Link>
                            <button
                                className="px-5 py-2 text-sm font-bold bg-[#137fec] text-white rounded-lg hover:bg-[#137fec]/90 transition-shadow shadow-md">
                                Comencemos
                            </button>
                        </div>
                    </div>
                </div>
                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-[#e7edf3] dark:border-slate-800 bg-white dark:bg-[#101922]">
                        <div className="flex flex-col p-6 gap-4">
                            <Link className="text-sm font-medium hover:text-[#137fec] transition-colors" to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>

                            <a className="text-sm font-medium hover:text-[#137fec] transition-colors" href="#" onClick={() => setIsMenuOpen(false)}>Features</a>
                            <a className="text-sm font-medium hover:text-[#137fec] transition-colors" href="#" onClick={() => setIsMenuOpen(false)}>Pricing</a>
                            <a className="text-sm font-medium hover:text-[#137fec] transition-colors" href="#" onClick={() => setIsMenuOpen(false)}>About</a>
                            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-[#e7edf3] dark:border-slate-800">
                                <Link to="/login" className="w-full px-4 py-2 text-sm font-bold bg-[#e7edf3] dark:bg-slate-800 rounded-lg hover:bg-[#d0d9e1] transition-colors block text-center">
                                    Login
                                </Link>
                                <button className="w-full px-5 py-2 text-sm font-bold bg-[#137fec] text-white rounded-lg hover:bg-[#137fec]/90 transition-shadow shadow-md">
                                    Comencemos
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <div className="bg-white">
                <section className="relative min-h-[85vh] flex items-center justify-center hero-curve" style={{ clipPath: 'ellipse(150% 100% at 50% 100%)' }}>
                    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
                        <div className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: 'linear-gradient(rgba(16, 25, 34, 0.75), rgba(16, 25, 34, 0.75)), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAJf-3XU_q1eGCQmjW5OZvlO_A5xfII8yPExui6gImCrkch9hKe1gu5dK8WjBSu4PBsNKfp3Kk7hikJ1Iz1bo--EHGEiS8GtyiZaX8TFKXmoiQrQMG2kp5G5ofrkODbo6swFc6u1_nE6fg58zkYR_fwUYJn2XaZ-4UCDAcb58yDFvCw-m5RwbvkVCwb0LzL0t55x1qhoeHucbb_TlGeuyUPlmjA_SGVnvWTQTKXB_qPRCMR3rn32hsj_W5VsL-IoYYxxSneAyr5Z_U")' }}>
                        </div>
                    </div>
                    <div className="relative z-10 max-w-[960px] mx-auto px-6 text-center">
                        <div className="flex flex-col gap-6 items-center">
                            <h1 className="text-white text-5xl md:text-7xl font-black leading-[1.1] tracking-tight">
                                EL ECOSISTEMA <br /> PARA LA GESTIÓN <br /> DE TU CONSORCIO
                            </h1>
                            <p className="text-slate-200 text-lg md:text-xl font-normal max-w-[700px] leading-relaxed">
                                La plataforma integral para administradores y propietarios que buscan transparencia, eficiencia y
                                una convivencia moderna.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center">
                                <Link
                                    to="/register"
                                    className="px-10 py-4 bg-[#137fec] text-white text-lg font-bold rounded-xl hover:scale-105 transition-transform shadow-xl shadow-[#137fec]/20 flex items-center justify-center">
                                    Solicitar Demo
                                </Link>
                                <button
                                    className="px-10 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 text-lg font-bold rounded-xl hover:bg-white/20 transition-colors">
                                    Ver Planes
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Stats Section 
            <section className="py-12 bg-white dark:bg-[#101922] -mt-16 relative z-20">
                <div className="max-w-[1100px] mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div
                            className="flex flex-col items-center gap-2 p-8 rounded-2xl border border-[#cfdbe7] dark:border-slate-800 bg-[#f6f7f8] dark:bg-slate-900/50">
                            <span className="material-symbols-outlined text-[#137fec] text-4xl">apartment</span>
                            <p className="text-3xl font-black text-[#137fec]">500+</p>
                            <p className="text-sm font-medium opacity-70 uppercase tracking-widest">Edificios Activos</p>
                        </div>
                        <div
                            className="flex flex-col items-center gap-2 p-8 rounded-2xl border border-[#cfdbe7] dark:border-slate-800 bg-[#f6f7f8] dark:bg-slate-900/50">
                            <span className="material-symbols-outlined text-[#137fec] text-4xl">groups</span>
                            <p className="text-3xl font-black text-[#137fec]">10k+</p>
                            <p className="text-sm font-medium opacity-70 uppercase tracking-widest">Usuarios Felices</p>
                        </div>
                        <div
                            className="flex flex-col items-center gap-2 p-8 rounded-2xl border border-[#cfdbe7] dark:border-slate-800 bg-[#f6f7f8] dark:bg-slate-900/50">
                            <span className="material-symbols-outlined text-[#137fec] text-4xl">location_city</span>
                            <p className="text-3xl font-black text-[#137fec]">25+</p>
                            <p className="text-sm font-medium opacity-70 uppercase tracking-widest">Ciudades</p>
                        </div>
                    </div>
                </div>
            </section>*/}

            {/* Features Grid 
            <section className="py-20 bg-[#f6f7f8] dark:bg-[#101922]">
                <div className="max-w-[1100px] mx-auto px-6">
                    <div className="flex flex-col gap-4 mb-16 text-center items-center">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-[700px]">
                            Todo lo que necesitas para una administración moderna
                        </h2>
                        <div className="w-20 h-1.5 bg-[#137fec] rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div
                            className="flex flex-col gap-5 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 flex items-center justify-center bg-[#137fec]/10 text-[#137fec] rounded-xl">
                                <span className="material-symbols-outlined text-3xl">visibility</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Transparencia Total</h3>
                                <p className="text-[#4c739a] dark:text-slate-400 text-sm leading-relaxed">
                                    Acceso instantáneo a liquidaciones, facturas y comprobantes para cada propietario desde su
                                    celular.
                                </p>
                            </div>
                        </div>
                        <div
                            className="flex flex-col gap-5 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 flex items-center justify-center bg-[#137fec]/10 text-[#137fec] rounded-xl">
                                <span className="material-symbols-outlined text-3xl">settings_suggest</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Eficiencia Operativa</h3>
                                <p className="text-[#4c739a] dark:text-slate-400 text-sm leading-relaxed">
                                    Automatización de cobranzas y conciliación bancaria. Minimizamos el error humano en un 90%.
                                </p>
                            </div>
                        </div>
                        <div
                            className="flex flex-col gap-5 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 flex items-center justify-center bg-[#137fec]/10 text-[#137fec] rounded-xl">
                                <span className="material-symbols-outlined text-3xl">forum</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Comunicación Fluida</h3>
                                <p className="text-[#4c739a] dark:text-slate-400 text-sm leading-relaxed">
                                    Muro de anuncios, sistema de reclamos con tickets y votaciones online para asambleas
                                    virtuales.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>*/}

            {/* Modules Section */}
            <section className="py-24 bg-white dark:bg-[#0d141b]">
                <div className="max-w-[1100px] mx-auto px-6">
                    <div className="flex flex-col gap-4 mb-16 text-center items-center">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-[800px]">
                            Pilares para una gestión rentable
                        </h2>
                        <p className="text-[#4c739a] dark:text-slate-400 text-lg md:text-xl max-w-[700px]">
                            Operación, finanzas y gobernanza en una sola plataforma con trazabilidad completa
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div
                            className="group flex flex-col gap-4 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all border-t-4 border-t-[#137fec]">
                            <div className="w-12 h-12 flex items-center justify-center bg-[#137fec]/10 text-[#137fec] rounded-lg">
                                <span className="material-symbols-outlined">receipt_long</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-3">Reclamos con trazabilidad total</h3>
                                <p className="text-[#4c739a] dark:text-slate-400 text-sm leading-relaxed">
                                    Tickets con ID único, responsables claros y evidencia adjunta. Cada reclamo queda registrado
                                    y medible.
                                </p>
                            </div>
                        </div>
                        <div
                            className="group flex flex-col gap-4 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all border-t-4 border-t-[#137fec]">
                            <div className="w-12 h-12 flex items-center justify-center bg-[#137fec]/10 text-[#137fec] rounded-lg">
                                <span className="material-symbols-outlined">engineering</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-3">Proveedores y órdenes digitales</h3>
                                <p className="text-[#4c739a] dark:text-slate-400 text-sm leading-relaxed">
                                    Base calificada de proveedores, órdenes de trabajo trazables y control de calidad por
                                    servicio.
                                </p>
                            </div>
                        </div>
                        <div
                            className="group flex flex-col gap-4 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all border-t-4 border-t-[#137fec]">
                            <div className="w-12 h-12 flex items-center justify-center bg-[#137fec]/10 text-[#137fec] rounded-lg">
                                <span className="material-symbols-outlined">account_balance_wallet</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-3">Transparencia financiera</h3>
                                <p className="text-[#4c739a] dark:text-slate-400 text-sm leading-relaxed">
                                    Liquidación automática, control de morosidad y acceso seguro a expensas y comprobantes.
                                </p>
                            </div>
                        </div>
                        <div
                            className="group flex flex-col gap-4 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all border-t-4 border-t-[#137fec]">
                            <div className="w-12 h-12 flex items-center justify-center bg-[#137fec]/10 text-[#137fec] rounded-lg">
                                <span className="material-symbols-outlined">calendar_month</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-3">Reservas de espacios comunes</h3>
                                <p className="text-[#4c739a] dark:text-slate-400 text-sm leading-relaxed">
                                    Calendario en tiempo real para SUM, terraza, parrillas y salas de reuniones. Reglas
                                    configurables y autogestión por WhatsApp.
                                </p>
                            </div>
                        </div>
                        <div
                            className="group flex flex-col gap-4 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all border-t-4 border-t-[#137fec]">
                            <div className="w-12 h-12 flex items-center justify-center bg-[#137fec]/10 text-[#137fec] rounded-lg">
                                <span className="material-symbols-outlined">gavel</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-3">Documentación legal</h3>
                                <p className="text-[#4c739a] dark:text-slate-400 text-sm leading-relaxed">
                                    Reglamentos, actas y comunicados en un repositorio seguro, siempre disponibles.
                                </p>
                            </div>
                        </div>
                        <div
                            className="group flex flex-col gap-4 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all border-t-4 border-t-[#137fec]">
                            <div className="w-12 h-12 flex items-center justify-center bg-[#137fec]/10 text-[#137fec] rounded-lg">
                                <span className="material-symbols-outlined">query_stats</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-3">Centro de mando ejecutivo</h3>
                                <p className="text-[#4c739a] dark:text-slate-400 text-sm leading-relaxed">
                                    Métricas en tiempo real de reclamos, finanzas y ocupación para decidir con datos.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Claims Management Section */}
            <section className="py-24 bg-[#f1f3f5] dark:bg-[#151f2a]">
                <div className="max-w-[1100px] mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="flex flex-col gap-6">
                            <div
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#137fec]/10 text-[#137fec] text-xs font-bold uppercase tracking-wider w-fit">
                                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                                Nuevo Módulo
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">Gestión de Reclamos
                                Inteligente</h2>
                            <p className="text-[#4c739a] dark:text-slate-400 text-lg leading-relaxed">
                                Olvidate de los mensajes de WhatsApp perdidos y los correos sin respuesta. Nuestro sistema
                                automatizado permite a los residentes reportar incidentes en segundos.
                            </p>
                            <div className="flex flex-col gap-4 mt-2">
                                <div className="flex items-start gap-4">
                                    <div
                                        className="mt-1 w-6 h-6 flex-shrink-0 bg-[#137fec] text-white rounded-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-sm">chat</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">Chatbot 24/7</h4>
                                        <p className="text-sm text-[#4c739a] dark:text-slate-400">Reportes inmediatos a través de
                                            una interfaz de chat intuitiva y amigable.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div
                                        className="mt-1 w-6 h-6 flex-shrink-0 bg-[#137fec] text-white rounded-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-sm">confirmation_number</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">Ticketing Automatizado</h4>
                                        <p className="text-sm text-[#4c739a] dark:text-slate-400">Cada reclamo genera un ticket
                                            único con seguimiento en tiempo real del estado de reparación.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative flex justify-center lg:justify-end">
                            <div
                                className="relative w-[300px] h-[600px] bg-[#101922] rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden">
                                <div className="h-6 bg-[#075e54] flex justify-between items-center px-6">
                                    <div className="text-[10px] text-white/80">10:02</div>
                                    <div className="flex gap-1">
                                        <div className="w-2.5 h-2.5 rounded-full border border-white/40"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                                    </div>
                                </div>
                                <div className="bg-[#075e54] p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white text-xl">corporate_fare</span>
                                    </div>
                                    <div>
                                        <h5 className="text-white text-sm font-bold">ConsorcioHub Bot</h5>
                                        <span className="text-white/70 text-[10px]">En línea</span>
                                    </div>
                                </div>
                                <div className="h-full bg-[#e5ddd5] p-4 flex flex-col gap-3 font-sans overflow-y-auto">
                                    <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-[85%] relative">
                                        <p className="text-[11px] text-gray-800">Hola 👋 Soy el asistente de tu edificio. ¿En qué
                                            puedo ayudarte hoy?</p>
                                        <span className="block text-[8px] text-gray-400 text-right mt-1">10:00</span>
                                    </div>
                                    <div
                                        className="bg-[#dcf8c6] p-3 rounded-lg rounded-tr-none shadow-sm max-w-[85%] self-end relative">
                                        <p className="text-[11px] text-gray-800">Quiero reportar una luz quemada en el pasillo del
                                            3er piso</p>
                                        <span className="block text-[8px] text-gray-400 text-right mt-1">10:02</span>
                                    </div>
                                    <div
                                        className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-[85%] relative border-l-4 border-[#137fec]">
                                        <p className="text-[11px] text-gray-800">Entendido. He creado el reclamo
                                            <strong>#482</strong>. 🛠️<br />Te notificaré cuando el encargado lo resuelva.
                                        </p>
                                        <div className="mt-2 pt-2 border-t border-gray-100 flex justify-center">
                                            <span className="text-[10px] text-[#137fec] font-bold">Ver estado</span>
                                        </div>
                                        <span className="block text-[8px] text-gray-400 text-right mt-1">10:02</span>
                                    </div>
                                </div>
                                <div className="absolute bottom-4 left-0 w-full px-2 flex gap-2">
                                    <div className="flex-1 bg-white rounded-full h-10 shadow-sm"></div>
                                    <div className="w-10 h-10 bg-[#075e54] rounded-full flex items-center justify-center shadow-sm">
                                        <span className="material-symbols-outlined text-white text-sm">send</span>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -z-10 -bottom-10 -right-10 w-64 h-64 bg-[#137fec]/10 rounded-full blur-3xl">
                            </div>
                            <div className="absolute -z-10 top-20 -left-10 w-48 h-48 bg-[#137fec]/5 rounded-full blur-2xl"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Governance Section */}
            <section className="py-24 bg-[#f8fafc] dark:bg-[#0f172a] border-y border-[#e2e8f0] dark:border-slate-800">
                <div className="max-w-[1100px] mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="flex flex-col gap-6 order-2 lg:order-1">
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">Asambleas con trazabilidad
                                legal y decisiones claras</h2>
                            <p className="text-[#4c739a] dark:text-slate-400 text-lg leading-relaxed">
                                Convocá, votá y documentá acuerdos en un solo flujo, con actas disponibles y reglamentos siempre
                                actualizados.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mt-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 flex-shrink-0 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-[#137fec]">
                                        <span className="material-symbols-outlined">description</span>
                                    </div>
                                    <p className="text-sm font-semibold">Convocatorias y orden del día centralizados</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 flex-shrink-0 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-[#137fec]">
                                        <span className="material-symbols-outlined">verified_user</span>
                                    </div>
                                    <p className="text-sm font-semibold">Votaciones registradas con evidencia</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 flex-shrink-0 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-[#137fec]">
                                        <span className="material-symbols-outlined">rule_folder</span>
                                    </div>
                                    <p className="text-sm font-semibold">Actas automáticas y archivo seguro</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 flex-shrink-0 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-[#137fec]">
                                        <span className="material-symbols-outlined">gavel</span>
                                    </div>
                                    <p className="text-sm font-semibold">Reglamentos y resoluciones siempre accesibles</p>
                                </div>
                            </div>
                            <button
                                className="mt-6 w-fit px-6 py-3 bg-[#137fec] text-white text-sm font-bold rounded-lg hover:bg-[#137fec]/90 transition-shadow shadow-md">
                                Solicitar demo de gobernanza
                            </button>
                        </div>
                        <div className="order-1 lg:order-2">
                            <div
                                className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <span
                                            className="inline-block px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold rounded-full mb-2">Finalizada</span>
                                        <h4 className="text-xl font-bold">Asamblea Ordinaria Anual</h4>
                                        <div className="flex items-center gap-2 mt-2 text-slate-500 text-sm">
                                            <span className="material-symbols-outlined text-base">calendar_today</span>
                                            <span>15 Oct, 2024 • 19:30hs</span>
                                        </div>
                                    </div>
                                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                        <span className="material-symbols-outlined text-slate-400">history_edu</span>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Orden del día
                                        </p>
                                        <div className="space-y-2">
                                            <div
                                                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                                                <span className="text-xs font-bold text-[#137fec]">1.</span>
                                                <span className="text-sm font-medium">Aprobación de Balance Anual</span>
                                            </div>
                                            <div
                                                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                                                <span className="text-xs font-bold text-[#137fec]">2.</span>
                                                <span className="text-sm font-medium">Renovación de fachada principal</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Resultados
                                            Votación Pto. 2</p>
                                        <div className="flex gap-1 h-3 rounded-full overflow-hidden mb-3">
                                            <div className="w-[75%] bg-[#137fec]"></div>
                                            <div className="w-[20%] bg-slate-300 dark:bg-slate-600"></div>
                                            <div className="w-[5%] bg-slate-100 dark:bg-slate-700"></div>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-bold">
                                            <div className="flex items-center gap-1"><span
                                                className="w-2 h-2 rounded-full bg-[#137fec]"></span> A FAVOR (75%)</div>
                                            <div className="flex items-center gap-1"><span
                                                className="w-2 h-2 rounded-full bg-slate-300"></span> EN CONTRA (20%)</div>
                                        </div>
                                    </div>
                                    <div
                                        className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <a className="flex items-center gap-2 text-[#137fec] font-bold text-sm hover:underline"
                                            href="#">
                                            <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                                            Ver Acta Generada
                                        </a>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <span className="material-symbols-outlined text-base">book</span>
                                            <span className="text-xs font-medium">Reglamento v2.4</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Spaces Section */}
            <section className="py-24 bg-white dark:bg-[#0d141b]">
                <div className="max-w-[1100px] mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-12 lg:gap-20 items-center">
                        <div className="flex flex-col gap-6">
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">Gestión total de espacios
                                comunes, a la medida de tu edificio</h2>
                            <p className="text-[#4c739a] dark:text-slate-400 text-lg leading-relaxed">
                                Configurá cada espacio como quieras, definí reglas de reserva y vinculá unidades funcionales con
                                propietarios y residentes para un control completo.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-4">
                                <div className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-[#137fec] text-2xl">calendar_month</span>
                                    <div className="flex flex-col gap-1">
                                        <h4 className="font-bold text-sm uppercase tracking-tight">Configuración flexible</h4>
                                        <p className="text-sm text-[#4c739a] dark:text-slate-400">Adaptado a cada espacio
                                            particular.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-[#137fec] text-2xl">apartment</span>
                                    <div className="flex flex-col gap-1">
                                        <h4 className="font-bold text-sm uppercase tracking-tight">Reservas trazables</h4>
                                        <p className="text-sm text-[#4c739a] dark:text-slate-400">Historial centralizado y auditoría
                                            en tiempo real.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-[#137fec] text-2xl">key</span>
                                    <div className="flex flex-col gap-1">
                                        <h4 className="font-bold text-sm uppercase tracking-tight">Vínculo con unidades</h4>
                                        <p className="text-sm text-[#4c739a] dark:text-slate-400">Control directo de propietarios y
                                            residentes.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-[#137fec] text-2xl">checklist</span>
                                    <div className="flex flex-col gap-1">
                                        <h4 className="font-bold text-sm uppercase tracking-tight">Administración única</h4>
                                        <p className="text-sm text-[#4c739a] dark:text-slate-400">Gestioná múltiples espacios desde
                                            un panel.</p>
                                    </div>
                                </div>
                            </div>
                            <button className="mt-4 flex items-center gap-2 text-[#137fec] font-bold hover:underline transition-all">
                                <span>Ver demo de reservas</span>
                                <span className="material-symbols-outlined text-base">arrow_forward</span>
                            </button>
                        </div>
                        <div className="relative flex items-center justify-center min-h-[400px]">
                            <div
                                className="w-full max-w-[340px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden transform -rotate-3 -translate-x-4">
                                <div
                                    className="p-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Calendario SUM
                                        / Terraza</span>
                                    <span className="material-symbols-outlined text-slate-400 text-sm">more_horiz</span>
                                </div>
                                <div className="p-4 grid grid-cols-7 gap-1">
                                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => (
                                        <div key={i} className={`h-8 bg-slate-50 dark:bg-slate-800 rounded flex items-center justify-center text-[10px] text-slate-400 ${day === 'D' ? 'font-bold' : ''}`}>
                                            {day}
                                        </div>
                                    ))}
                                    <div className="h-12 border border-slate-100 dark:border-slate-800 rounded"></div>
                                    <div className="h-12 border border-slate-100 dark:border-slate-800 rounded"></div>
                                    <div className="h-12 border border-slate-100 dark:border-slate-800 rounded"></div>
                                    <div className="h-12 border border-slate-100 dark:border-slate-800 rounded"></div>
                                    <div
                                        className="h-12 bg-[#137fec]/20 border border-[#137fec]/30 rounded flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-[#137fec] rounded-full animate-pulse"></div>
                                    </div>
                                    <div className="h-12 border border-slate-100 dark:border-slate-800 rounded"></div>
                                    <div className="h-12 border border-slate-100 dark:border-slate-800 rounded"></div>
                                </div>
                                <div className="p-4 pt-0">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 bg-[#137fec] text-white rounded-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-xs">event</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold">Reserva confirmada</p>
                                            <p className="text-[9px] text-slate-500">Unidad 4B • Hoy 20:00hs</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="absolute w-full max-w-[320px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform translate-x-8 translate-y-12 z-10">
                                <div
                                    className="p-4 border-b border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-sm">person_search</span>
                                    </div>
                                    <h4 className="text-xs font-bold">Unidades Funcionales</h4>
                                </div>
                                <div className="p-2 divide-y divide-slate-50 dark:divide-slate-800">
                                    <div className="p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-bold">
                                                1A</div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold">Martín Pérez</span>
                                                <span className="text-[8px] text-slate-500">Propietario Residente</span>
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                    </div>
                                    <div className="p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-bold">
                                                2C</div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold">Laura Gómez</span>
                                                <span className="text-[8px] text-slate-500">Inquilino</span>
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                    </div>
                                    <div className="p-3 flex items-center justify-between opacity-50">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-bold">
                                                3B</div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold">Carlos Rossi</span>
                                                <span className="text-[8px] text-slate-500">Propietario</span>
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined text-slate-300 text-sm">block</span>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="absolute -top-4 right-0 lg:-right-4 z-20 bg-black dark:bg-[#137fec] text-white px-4 py-2 rounded-xl text-[10px] font-bold shadow-2xl flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">info</span>
                                Reglas por espacio: horarios, cupos y costos
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Providers Section */}
            <section className="py-24 bg-[#f6f7f8] dark:bg-[#151f2a] border-t border-[#e2e8f0] dark:border-slate-800">
                <div className="max-w-[1100px] mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative flex flex-col items-center justify-center py-12">
                            <div className="flex flex-col gap-10 w-full max-w-sm">
                                <div
                                    className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                                    <div
                                        className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-xl">report_problem</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Paso 1</p>
                                        <h4 className="text-sm font-bold">Reclamo generado</h4>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-300 ml-auto">trending_flat</span>
                                </div>
                                <div
                                    className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 translate-x-4">
                                    <div
                                        className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-xl">person_add</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Paso 2</p>
                                        <h4 className="text-sm font-bold">Asignación inteligente</h4>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-300 ml-auto">trending_flat</span>
                                </div>
                                <div
                                    className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                                    <div
                                        className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-xl">task_alt</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Paso 3</p>
                                        <h4 className="text-sm font-bold">Resolución y Cierre</h4>
                                    </div>
                                    <span className="material-symbols-outlined text-green-500 ml-auto">check_circle</span>
                                </div>
                            </div>
                            <div
                                className="absolute top-1/2 left-1/2 lg:left-3/4 transform -translate-x-1/2 -translate-y-1/2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-5 z-20">
                                <div className="flex flex-col items-center text-center gap-3">
                                    <div className="relative">
                                        <img alt="Provider"
                                            className="w-16 h-16 rounded-full bg-slate-100 border-2 border-[#137fec]/20"
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDM9vfRHSklnIc9-E1ol3w1La7sa-wNARd0-wssJDvVodtnbf6MooN2IiwvllLiOLKBqozrxx9tWsCtfEH-snRM1QSJVuaitDkSlaZek3FIWO7fisMKmxVQc6VrDiBu4jW8DY2hsjBPq2JkgBmWSnTlUflVKpG4ocRtJJv1eNeORXdSiVKDgVepHLy_ll5SrVvhIDM1rPs2dfsH0JiDxJ5omGTdeaVvWVVhVBZcb1sDxv-LdM8ABtDcueOnm9C-G5T2qB9qtuucwtQ" />
                                        <div
                                            className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full">
                                        </div>
                                    </div>
                                    <div>
                                        <span
                                            className="inline-block px-2 py-0.5 bg-[#137fec]/10 text-[#137fec] text-[9px] font-black uppercase rounded mb-1">Proveedor
                                            asignado</span>
                                        <h5 className="text-sm font-bold">Roberto Sánchez</h5>
                                        <p className="text-[10px] text-slate-500 font-medium">Especialista en Plomería</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-yellow-400">
                                        <span className="material-symbols-outlined text-sm text-yellow-400">star</span>
                                        <span className="material-symbols-outlined text-sm text-yellow-400">star</span>
                                        <span className="material-symbols-outlined text-sm text-yellow-400">star</span>
                                        <span className="material-symbols-outlined text-sm text-yellow-400">star</span>
                                        <span className="material-symbols-outlined text-sm text-yellow-400">star_half</span>
                                        <span className="text-slate-400 text-[10px] ml-1 font-bold">4.8</span>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="absolute -bottom-4 lg:right-0 bg-[#137fec] text-white px-5 py-3 rounded-2xl shadow-xl z-10">
                                <p className="text-xs font-bold">Tiempo medio de asignación: horas, no días</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-6">
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">Proveedores confiables,
                                asignados en minutos</h2>
                            <p className="text-[#4c739a] dark:text-slate-400 text-lg leading-relaxed">
                                Centralizá la bolsa de proveedores, enviá órdenes digitales y resolvé reclamos con trazabilidad
                                completa.
                            </p>
                            <div className="space-y-6 mt-4">
                                <div className="flex items-start gap-4">
                                    <div
                                        className="w-10 h-10 flex-shrink-0 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-[#137fec]">
                                        <span className="material-symbols-outlined">build</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-base">Bolsa de proveedores calificados dentro de la plataforma
                                        </h4>
                                        <p className="text-sm text-[#4c739a] dark:text-slate-400">Directorio interno con todos los
                                            prestadores de confianza del consorcio.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div
                                        className="w-10 h-10 flex-shrink-0 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-[#137fec]">
                                        <span className="material-symbols-outlined">checklist</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-base">Asignación inteligente desde cada reclamo</h4>
                                        <p className="text-sm text-[#4c739a] dark:text-slate-400">Vinculá automáticamente al
                                            proveedor adecuado desde cada reclamo abierto.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div
                                        className="w-10 h-10 flex-shrink-0 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-[#137fec]">
                                        <span className="material-symbols-outlined">phone_iphone</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-base">Órdenes digitales con seguimiento y evidencia</h4>
                                        <p className="text-sm text-[#4c739a] dark:text-slate-400">Controlá el progreso con evidencia
                                            fotográfica y firmas digitales de conformidad.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div
                                        className="w-10 h-10 flex-shrink-0 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-[#137fec]">
                                        <span className="material-symbols-outlined">star</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-base">Historial y calificaciones por servicio</h4>
                                        <p className="text-sm text-[#4c739a] dark:text-slate-400">Medí el rendimiento de cada
                                            servicio con un sistema de ratings por los vecinos.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-6">
                                <button
                                    className="flex items-center gap-2 text-[#137fec] font-black hover:translate-x-1 transition-transform group">
                                    <span>Ver demo de proveedores</span>
                                    <span
                                        className="material-symbols-outlined text-base group-hover:scale-110 transition-transform">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Expenses Section */}
            <section className="py-24 bg-white dark:bg-[#0d141b] border-t border-[#e2e8f0] dark:border-slate-800">
                <div className="max-w-[1100px] mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="flex flex-col gap-6">
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">Expensas claras, al día y
                                sin fricción.</h2>
                            <p className="text-[#4c739a] dark:text-slate-400 text-lg leading-relaxed">
                                Liquidación automática, seguimiento de pagos y comunicación inmediata por WhatsApp. El consorcio
                                gana orden y los residentes ganan transparencia.
                            </p>
                            <div className="grid grid-cols-1 gap-6 mt-4">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 flex-shrink-0 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-[#137fec] flex items-center justify-center">
                                        <span className="material-symbols-outlined">description</span>
                                    </div>
                                    <p className="font-medium text-slate-700 dark:text-slate-300">Liquidación automática y
                                        calendarios de vencimiento</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 flex-shrink-0 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-[#137fec] flex items-center justify-center">
                                        <span className="material-symbols-outlined">payments</span>
                                    </div>
                                    <p className="font-medium text-slate-700 dark:text-slate-300">Control de morosidad con reportes
                                        en tiempo real</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 flex-shrink-0 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-[#137fec] flex items-center justify-center">
                                        <span className="material-symbols-outlined">check_circle_outline</span>
                                    </div>
                                    <p className="font-medium text-slate-700 dark:text-slate-300">Acceso a comprobantes y detalle de
                                        gastos</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 flex-shrink-0 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-[#137fec] flex items-center justify-center">
                                        <span className="material-symbols-outlined">chat</span>
                                    </div>
                                    <p className="font-medium text-slate-700 dark:text-slate-300">Notificaciones y recordatorios vía
                                        WhatsApp</p>
                                </div>
                            </div>
                            <button className="mt-4 flex items-center gap-2 text-[#137fec] font-bold text-sm hover:underline w-fit">
                                <span>Ver demo de expensas</span>
                                <span className="material-symbols-outlined text-base">arrow_forward</span>
                            </button>
                        </div>
                        <div className="relative">
                            <div
                                className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Panel Financiero</h4>
                                    <span
                                        className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 text-[10px] font-bold rounded">Updated
                                        in real-time</span>
                                </div>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div
                                            className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Cobranza del mes</p>
                                            <p className="text-xl font-black text-[#137fec]">84.2%</p>
                                            <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2">
                                                <div className="bg-[#137fec] h-full rounded-full" style={{ width: '84%' }}></div>
                                            </div>
                                        </div>
                                        <div
                                            className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Recupero de deuda</p>
                                            <p className="text-xl font-black text-green-500">+$124k</p>
                                            <div className="flex items-end gap-1 h-8 mt-2">
                                                <div className="w-2 bg-green-200 dark:bg-green-900/40 h-[40%] rounded-t-sm"></div>
                                                <div className="w-2 bg-green-300 dark:bg-green-800/60 h-[60%] rounded-t-sm"></div>
                                                <div className="w-2 bg-green-400 dark:bg-green-700/80 h-[85%] rounded-t-sm"></div>
                                                <div className="w-2 bg-green-500 h-full rounded-t-sm"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Últimas transacciones</p>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                                                        4B</div>
                                                    <span>Pago Expensas - Oct</span>
                                                </div>
                                                <span className="font-bold text-green-500">+$45.200</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                                                        1C</div>
                                                    <span>Pago Expensas - Oct</span>
                                                </div>
                                                <span className="font-bold text-green-500">+$38.900</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="absolute -bottom-6 -right-6 lg:-right-10 w-64 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-20 animate-bounce-subtle">
                                <div className="flex items-start gap-3">
                                    <div
                                        className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0 text-white">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path
                                                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.431 5.63 1.432h.006c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z">
                                            </path>
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-800 dark:text-white">ConsorcioHub</p>
                                        <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">Expensa lista para
                                            pagar</p>
                                        <button
                                            className="mt-2 text-[9px] font-bold text-[#137fec] bg-[#137fec]/5 px-2 py-1 rounded">Ver
                                            detalle</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Plans Section 
            <section className="py-24 bg-white dark:bg-[#0d141b] overflow-hidden">
                <div className="max-w-[1100px] mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black mb-4 tracking-tight">Planes a medida</h2>
                        <p className="text-[#4c739a] dark:text-slate-400 max-w-[600px] mx-auto">
                            Escalamos con vos, desde un solo edificio hasta grandes administraciones con cientos de unidades.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div
                            className="flex flex-col gap-8 rounded-2xl border border-[#cfdbe7] dark:border-slate-800 bg-[#f6f7f8] dark:bg-slate-900/40 p-8">
                            <div className="flex flex-col gap-2">
                                <h3 className="text-lg font-bold">Básico</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black">$0</span>
                                    <span className="text-sm font-bold opacity-60">/mes</span>
                                </div>
                                <p className="text-xs text-[#4c739a]">Ideal para consorcios pequeños autogestionados.</p>
                            </div>
                            <button
                                className="w-full py-3 px-4 bg-white dark:bg-slate-800 border border-[#cfdbe7] dark:border-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors">
                                Comenzar Gratis
                            </button>
                            <ul className="flex flex-col gap-4">
                                <li className="flex items-center gap-3 text-sm">
                                    <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                                    Gestión de 1 edificio
                                </li>
                                <li className="flex items-center gap-3 text-sm">
                                    <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                                    Expensas digitales basicas
                                </li>
                                <li className="flex items-center gap-3 text-sm">
                                    <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                                    Soporte por email
                                </li>
                            </ul>
                        </div>
                        <div
                            className="flex flex-col gap-8 rounded-2xl border-2 border-[#137fec] bg-white dark:bg-slate-900 p-8 shadow-xl relative scale-105 z-10">
                            <div
                                className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#137fec] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full">
                                Más Popular
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-lg font-bold">Administrador</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black">$49</span>
                                    <span className="text-sm font-bold opacity-60">/mes</span>
                                </div>
                                <p className="text-xs text-[#4c739a]">Para profesionales con múltiples edificios.</p>
                            </div>
                            <button
                                className="w-full py-3 px-4 bg-[#137fec] text-white text-sm font-bold rounded-lg hover:bg-[#137fec]/90 transition-colors shadow-lg shadow-[#137fec]/20">
                                Prueba Gratis 14 Días
                            </button>
                            <ul className="flex flex-col gap-4">
                                <li className="flex items-center gap-3 text-sm">
                                    <span className="material-symbols-outlined text-[#137fec] text-lg">check_circle</span>
                                    Gestión de hasta 5 edificios
                                </li>
                                <li className="flex items-center gap-3 text-sm">
                                    <span className="material-symbols-outlined text-[#137fec] text-lg">check_circle</span>
                                    Cobranza automática con QR
                                </li>
                                <li className="flex items-center gap-3 text-sm">
                                    <span className="material-symbols-outlined text-[#137fec] text-lg">check_circle</span>
                                    Reportes financieros avanzados
                                </li>
                                <li className="flex items-center gap-3 text-sm">
                                    <span className="material-symbols-outlined text-[#137fec] text-lg">check_circle</span>
                                    Votaciones online
                                </li>
                            </ul>
                        </div>
                        <div
                            className="flex flex-col gap-8 rounded-2xl border border-[#cfdbe7] dark:border-slate-800 bg-[#f6f7f8] dark:bg-slate-900/40 p-8">
                            <div className="flex flex-col gap-2">
                                <h3 className="text-lg font-bold">Premium</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-[#137fec]">$99</span>
                                    <span className="text-sm font-bold opacity-60">/mes</span>
                                </div>
                                <p className="text-xs text-[#4c739a]">Control total para grandes empresas.</p>
                            </div>
                            <button
                                className="w-full py-3 px-4 bg-white dark:bg-slate-800 border border-[#cfdbe7] dark:border-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors">
                                Contactar Ventas
                            </button>
                            <ul className="flex flex-col gap-4">
                                <li className="flex items-center gap-3 text-sm">
                                    <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                                    Edificios ilimitados
                                </li>
                                <li className="flex items-center gap-3 text-sm">
                                    <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                                    App móvil personalizada
                                </li>
                                <li className="flex items-center gap-3 text-sm">
                                    <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                                    Soporte 24/7 Priority
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>*/}

            {/* Footer */}
            {/* Footer */}
            <footer className="bg-[#f6f7f8] dark:bg-slate-950 py-16 border-t border-[#e7edf3] dark:border-slate-900">
                <div className="max-w-[1100px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="flex flex-col gap-6 col-span-1 md:col-span-1">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 text-[#137fec]">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 48 48">
                                    <path
                                        d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z">
                                    </path>
                                </svg>
                                <h2 className="text-lg font-bold text-black dark:text-white">ConsorcioHub</h2>
                            </div>
                            <p className="text-sm text-[#4c739a] dark:text-slate-500 leading-relaxed">
                                Transformando la vida en comunidad a través de la tecnología y la transparencia.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <a href="#" className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-[#137fec] hover:text-white transition-all">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                </svg>
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-[#137fec] hover:text-white transition-all">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                </svg>
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-[#137fec] hover:text-white transition-all">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.373c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                                </svg>
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-[#137fec] hover:text-white transition-all">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                                </svg>
                            </a>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h4 className="font-bold">Producto</h4>
                        <nav className="flex flex-col gap-2 text-sm text-[#4c739a] dark:text-slate-400">
                            <a className="hover:text-[#137fec] transition-colors" href="#">Funciones</a>
                            <a className="hover:text-[#137fec] transition-colors" href="#">Para Propietarios</a>
                            <a className="hover:text-[#137fec] transition-colors" href="#">Para Administradores</a>
                            <a className="hover:text-[#137fec] transition-colors" href="#">Precios</a>
                        </nav>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h4 className="font-bold">Empresa</h4>
                        <nav className="flex flex-col gap-2 text-sm text-[#4c739a] dark:text-slate-400">
                            <a className="hover:text-[#137fec] transition-colors" href="#">Sobre Nosotros</a>
                            <a className="hover:text-[#137fec] transition-colors" href="#">Blog</a>
                            <a className="hover:text-[#137fec] transition-colors" href="#">Contacto</a>
                            <a className="hover:text-[#137fec] transition-colors" href="#">Centro de Ayuda</a>

                        </nav>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h4 className="font-bold">Contacto</h4>
                        <div className="flex flex-col gap-3 text-sm text-[#4c739a] dark:text-slate-500">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-[#137fec] text-lg mt-0.5">location_on</span>
                                <p>General Villegas<br />Buenos Aires, Argentina (C6230)</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#137fec] text-lg">mail</span>
                                <a href="mailto:hola@consorciohub.com" className="hover:text-[#137fec]">hola@consorciohub.com</a>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#137fec] text-lg">call</span>
                                <a href="https://wa.me/543388430068" className="hover:text-[#137fec]">+54 3388 430068</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="max-w-[1100px] mx-auto px-6 mt-16 pt-8 border-t border-[#e7edf3] dark:border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-[#4c739a]">© 2026 ConsorcioHub. Todos los derechos reservados.</p>
                    <div className="flex gap-6 text-xs text-[#4c739a] font-medium">
                        <a href="#" className="hover:text-[#137fec] transition-colors">Privacidad</a>
                        <a href="#" className="hover:text-[#137fec] transition-colors">Términos y Condiciones</a>
                        <a href="#" className="hover:text-[#137fec] transition-colors">Cookies</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
