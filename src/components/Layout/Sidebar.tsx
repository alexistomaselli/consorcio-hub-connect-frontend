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

interface Props {
  className?: string;
  onNavItemClick?: () => void;
}

export function Sidebar({ className, onNavItemClick }: Props) {
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
      title: "Invitaciones",
      icon: Megaphone, // Using Megaphone as placeholder icon, previously 'invitations' wasn't there
      path: "/invitations",
      roles: ['BUILDING_ADMIN'] as UserRole[]
    },
    {
      title: "Usuarios",
      icon: Users,
      path: "/users",
      roles: ['SUPER_ADMIN'] as UserRole[]
    },
    {
      title: "Expensas",
      icon: Wallet,
      path: "/expenses",
      roles: ['BUILDING_ADMIN', 'OWNER', 'RESIDENT'] as UserRole[]
    },
    {
      title: "Reclamos",
      icon: ClipboardList,
      path: "/claims",
      roles: ['BUILDING_ADMIN', 'RESIDENT'] as UserRole[]
    },
    {
      title: "Mis Reclamos",
      icon: ClipboardList,
      path: "/my-claims",
      roles: ['OWNER', 'RESIDENT'] as UserRole[]
    },
    {
      title: "Comunicados",
      icon: Megaphone,
      path: "/announcements",
      roles: ['BUILDING_ADMIN', 'OWNER', 'RESIDENT'] as UserRole[],
      hidden: true
    },
    {
      title: "Reservas",
      icon: Calendar,
      path: "/bookings",
      roles: ['BUILDING_ADMIN', 'OWNER', 'RESIDENT'] as UserRole[]
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
    },
    {
      title: "Trabajos Asignados",
      icon: Wrench,
      path: "/service-claims",
      roles: ['SERVICE_PROVIDER'] as UserRole[]
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
    <div className={cn("flex h-full flex-col bg-white border-r border-slate-200", className)}>
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
            <p className="text-xs text-slate-500 font-medium tracking-wide">
              {currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'BUILDING_ADMIN' ? 'Panel de Admin' : 'Mi Panel'}
            </p>
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
                onClick={() => {
                  navigate(item.path);
                  if (onNavItemClick) onNavItemClick();
                }}
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
            onClick={() => {
              navigate(settingsItem.path);
              if (onNavItemClick) onNavItemClick();
            }}
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
            onClick={() => {
              navigate(globalSettingsItem.path);
              if (onNavItemClick) onNavItemClick();
            }}
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
