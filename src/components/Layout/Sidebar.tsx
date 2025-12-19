import { cn } from "@/lib/utils";
import { UserRole } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Building2,
  LogOut,
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  Calendar,
  ClipboardList,
  Key,
  Wrench,
  Grid,
  Wallet,
  Megaphone
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props { }

export function Sidebar({ }: Props) {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  // Main navigation items
  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      roles: ['BUILDING_ADMIN', 'SUPER_ADMIN'] as UserRole[]
    },
    {
      title: "Edificios", // Or "Unidades" if we want to match screenshot exactly, keeping functional name for now
      icon: Building2,
      path: "/buildings",
      roles: ['SUPER_ADMIN'] as UserRole[]
    },
    {
      title: "Propietarios", // Matches "Residentes" concept
      icon: Users,
      path: "/owners",
      roles: ['BUILDING_ADMIN'] as UserRole[]
    },
    {
      title: "Usuarios",
      icon: Users,
      path: "/users",
      roles: ['SUPER_ADMIN'] as UserRole[]
    },
    {
      title: "Expensas", // Matches "Finanzas" concept
      icon: Wallet,
      path: "/expenses",
      roles: ['USER', 'BUILDING_ADMIN', 'OWNER'] as UserRole[]
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
      title: "Comunicados", // New item to match screenshot structure if it exists, otherwise placeholder or mapped
      icon: Megaphone,
      path: "/announcements", // Assuming functionality might effectively exist or be planned
      roles: ['BUILDING_ADMIN', 'USER'] as UserRole[],
      hidden: true // Hiding for now if route doesn't exist, remove hidden if we want to show it
    },
    {
      title: "Reservas",
      icon: Calendar,
      path: "/bookings",
      roles: ['USER', 'BUILDING_ADMIN'] as UserRole[]
    },
    {
      title: "Espacios",
      icon: Grid,
      path: "/spaces",
      roles: ['BUILDING_ADMIN'] as UserRole[]
    },
    {
      title: "Servicios",
      icon: Wrench,
      path: "/services",
      roles: ['SUPER_ADMIN'] as UserRole[]
    }
  ];

  // Settings item separate for bottom positioning
  const settingsItem = {
    title: "Configuración",
    icon: Settings,
    path: "/settings/building",
    roles: ['BUILDING_ADMIN'] as UserRole[]
  };

  const globalSettingsItem = {
    title: "Configuración Global",
    icon: Settings,
    path: "/admin/settings",
    roles: ['SUPER_ADMIN'] as UserRole[]
  };

  const filteredMenu = menuItems.filter(item =>
    !item.hidden && item.roles.includes(currentUser?.role as UserRole)
  );

  const showSettings = settingsItem.roles.includes(currentUser?.role as UserRole);

  return (
    <div className="flex h-full flex-col bg-white border-r border-slate-200">
      {/* Sidebar Header */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
            {/* Logo Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 12L12 22L22 12L12 2Z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-lg leading-tight">ConsorcioHub</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide">Panel de Admin</p>
          </div>
        </div>
      </div>

      {/* Main Menu */}
      <div className="flex-1 px-4 overflow-y-auto py-2">
        <div className="space-y-1">
          {filteredMenu.map((item, index) => {
            const active = isActive(item.path);
            return (
              <Button
                key={index}
                variant="ghost"
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full justify-start h-11 mb-1 font-medium transition-all duration-200",
                  active
                    ? "bg-blue-50 text-blue-600 hover:bg-blue-100/50 hover:text-blue-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn("mr-3 h-[18px] w-[18px]", active ? "text-blue-600" : "text-slate-500")} />
                {item.title}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Settings & Logout */}
      <div className="p-4 mt-auto border-t border-slate-100 space-y-1 bg-slate-50/30">
        {showSettings && (
          <Button
            variant="ghost"
            onClick={() => navigate(settingsItem.path)}
            className={cn(
              "w-full justify-start h-11 font-medium transition-all duration-200",
              isActive(settingsItem.path)
                ? "bg-blue-50 text-blue-600 hover:bg-blue-100/50"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <settingsItem.icon className={cn("mr-3 h-[18px] w-[18px]", isActive(settingsItem.path) ? "text-blue-600" : "text-slate-500")} />
            {settingsItem.title}
          </Button>
        )}

        {currentUser?.role === 'SUPER_ADMIN' && (
          <Button
            variant="ghost"
            onClick={() => navigate(globalSettingsItem.path)}
            className={cn(
              "w-full justify-start h-11 font-medium transition-all duration-200",
              isActive(globalSettingsItem.path)
                ? "bg-blue-50 text-blue-600 hover:bg-blue-100/50"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <globalSettingsItem.icon className={cn("mr-3 h-[18px] w-[18px]", isActive(globalSettingsItem.path) ? "text-blue-600" : "text-slate-500")} />
            {globalSettingsItem.title}
          </Button>
        )}

        <Button
          variant="ghost"
          className="w-full justify-start h-11 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-[18px] w-[18px]" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
