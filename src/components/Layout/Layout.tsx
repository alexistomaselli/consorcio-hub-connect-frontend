import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
}

export function Layout({
  children,
}: Props) {
  // Estado del sidebar, por defecto cerrado
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Función para colapsar el sidebar en dispositivos móviles
  const collapseSidebarOnMobile = () => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Detectar si es mobile o desktop para establecer el estado inicial
  useEffect(() => {
    const handleResize = () => {
      // Si es desktop (>= 768px), abrir el sidebar, si es mobile cerrarlo
      setIsSidebarOpen(window.innerWidth >= 768);
    };
    
    // Establecer el estado inicial
    handleResize();
    
    // Agregar listener para cambios de tamaño
    window.addEventListener('resize', handleResize);
    
    // Limpieza
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-background">
      <aside
        className={cn(
          "border-r bg-gray-50/40 transition-all duration-300",
          isSidebarOpen ? "w-72" : "w-0 overflow-hidden"
        )}
      >
        <Sidebar onNavigate={() => {
          // Solo colapsar en dispositivos móviles
          if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
          }
        }} />
      </aside>
      <div className="flex-1 flex flex-col">
        <DashboardHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}
