import { Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const LandingNavbar = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const scrollToSection = (id: string) => {
        setIsOpen(false);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        } else {
            navigate(`/#${id}`);
        }
    };

    const MobileLink = ({ to, children }: { to: string, children: React.ReactNode }) => {
        const isHashLink = to.startsWith('/#');

        const handleClick = (e: React.MouseEvent) => {
            if (isHashLink) {
                e.preventDefault();
                const id = to.replace('/#', '');
                scrollToSection(id);
            } else {
                setIsOpen(false);
            }
        };

        if (isHashLink) {
            return (
                <a
                    href={to}
                    onClick={handleClick}
                    className="text-lg font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors py-2"
                >
                    {children}
                </a>
            );
        }

        return (
            <Link
                to={to}
                onClick={handleClick}
                className="text-lg font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors py-2"
            >
                {children}
            </Link>
        );
    };

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
                        {/* Logo */}
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-2 rounded-lg shadow-lg shadow-blue-500/20">
                                <span className="material-symbols-outlined text-2xl leading-none">apartment</span>
                            </div>
                            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">ConsorcioHub</span>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-8">
                            <a href="/#funcionalidades" className="text-sm font-medium text-slate-600 hover:text-blue-500 dark:text-slate-300 transition-colors">Funcionalidades</a>
                            <a href="/#planes" className="text-sm font-medium text-slate-600 hover:text-blue-500 dark:text-slate-300 transition-colors">Planes</a>
                            <a href="/#contacto" className="text-sm font-medium text-slate-600 hover:text-blue-500 dark:text-slate-300 transition-colors">Contacto</a>
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-4">
                            {!currentUser ? (
                                <>
                                    <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-blue-500 dark:text-slate-200 transition-colors">
                                        Ingresar
                                    </Link>
                                    <Link to="/register" state={{ selectedPlan: { name: 'Inicial', price: 0 } }} className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transform hover:-translate-y-0.5">
                                        Prueba Gratis
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to={currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'BUILDING_ADMIN' ? "/dashboard" : "/my-claims"}
                                        className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transform hover:-translate-y-0.5"
                                    >
                                        Ir al Panel
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        onClick={() => logout()}
                                        className="text-sm font-semibold text-slate-700 hover:text-red-500 dark:text-slate-200 transition-colors h-auto p-0 hover:bg-transparent"
                                    >
                                        Cerrar Sesión
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Trigger */}
                        <div className="md:hidden flex items-center gap-4">
                            {!currentUser ? (
                                <Link to="/register" state={{ selectedPlan: { name: 'Inicial', price: 0 } }} className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all shadow-md">
                                    Prueba Gratis
                                </Link>
                            ) : (
                                <Link to={currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'BUILDING_ADMIN' ? "/dashboard" : "/my-claims"} className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all shadow-md">
                                    Panel
                                </Link>
                            )}
                            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-slate-700 dark:text-white">
                                        <Menu className="h-6 w-6" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-[300px] flex flex-col gap-8 p-8">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-2 rounded-lg shadow-lg shadow-blue-500/20">
                                            <span className="material-symbols-outlined text-2xl leading-none">apartment</span>
                                        </div>
                                        <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">ConsorcioHub</span>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <MobileLink to="/#funcionalidades">Funcionalidades</MobileLink>
                                        <MobileLink to="/#planes">Planes</MobileLink>
                                        <MobileLink to="/#contacto">Contacto</MobileLink>
                                        <div className="h-px bg-slate-200 dark:bg-slate-800 my-2"></div>
                                        {!currentUser ? (
                                            <>
                                                <MobileLink to="/login">Ingresar</MobileLink>
                                                <MobileLink to="/register">Crear Cuenta</MobileLink>
                                            </>
                                        ) : (
                                            <>
                                                <MobileLink to={currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'BUILDING_ADMIN' ? "/dashboard" : "/my-claims"}>Ir al Panel</MobileLink>
                                                <button
                                                    onClick={() => {
                                                        logout();
                                                        setIsOpen(false);
                                                    }}
                                                    className="text-lg font-medium text-red-500 hover:text-red-600 transition-colors py-2 text-left"
                                                >
                                                    Cerrar Sesión
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default LandingNavbar;
