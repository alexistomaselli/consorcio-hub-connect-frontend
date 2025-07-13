import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

// Definir los roles de usuario disponibles
type UserRole = 'USER' | 'OWNER' | 'BUILDING_ADMIN' | 'SUPER_ADMIN';
import { useNavigate } from "react-router-dom";
import { Building2, LogOut, Home, Users, Settings, FileText, Calendar, ClipboardList, Key, Wrench, Grid, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";


interface Props {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: Props) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Notificar navegación antes de logout (colapsará el sidebar en móviles)
      onNavigate?.();
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const { currentUser } = useAuth();

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      path: "/dashboard",
      roles: ['BUILDING_ADMIN', 'SUPER_ADMIN'] as UserRole[]
    },
    {
      title: "Edificios",
      icon: Building2,
      path: "/buildings",
      roles: ['SUPER_ADMIN'] as UserRole[]
    },
    {
      title: "Reclamos",
      icon: ClipboardList,
      path: "/claims",
      roles: ['USER', 'BUILDING_ADMIN'] as UserRole[]
    },
    {
      title: "Mis Reclamos",
      icon: ClipboardList,
      path: "/my-claims",
      roles: ['OWNER'] as UserRole[]
    },
    {
      title: "Expensas",
      icon: FileText,
      path: "/expenses",
      roles: ['USER', 'BUILDING_ADMIN'] as UserRole[]
    },
    {
      title: "Reservas",
      icon: Calendar,
      path: "/bookings",
      roles: ['USER', 'BUILDING_ADMIN'] as UserRole[]
    },
    {
      title: "Propietarios",
      icon: Key,
      path: "/owners",
      roles: ['BUILDING_ADMIN'] as UserRole[]
    },
    {
      title: "Espacios",
      icon: Grid,
      path: "/spaces",
      roles: ['BUILDING_ADMIN'] as UserRole[]
    },
    {
      title: "Reglamento",
      icon: BookOpen,
      path: "/regulations",
      roles: ['BUILDING_ADMIN', 'OWNER'] as UserRole[]
    },
    {
      title: "Usuarios",
      icon: Users,
      path: "/users",
      roles: ['SUPER_ADMIN'] as UserRole[]
    },
    {
      title: "Servicios",
      icon: Wrench,
      path: "/services",
      roles: ['SUPER_ADMIN'] as UserRole[]
    },
    {
      title: "Configuración",
      icon: Settings,
      path: "/settings/building",
      roles: ['BUILDING_ADMIN', 'SUPER_ADMIN'] as UserRole[]
    }
  ];

  const filteredMenu = menuItems.filter(item => 
    item.roles.includes(currentUser?.role as UserRole)
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 p-4">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight">
              Menú Principal
            </h2>
            <div className="space-y-1">
              {filteredMenu.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    navigate(item.path);
                    // Notificar al componente padre que se ha navegado
                    onNavigate?.();
                  }}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              ))}
            </div>
          </div>
      </div>
      
      {/* Botón de cerrar sesión siempre visible */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
