import { Bell, Settings, User, Menu } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

interface Props {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: Props) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <header className="border-b bg-white">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="hover:bg-gray-100 h-9 w-9"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900">ConsorcioHub</h1>
        </div>

        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="relative h-9 w-9 text-slate-500 hover:bg-slate-50">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
              2
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 h-9 px-2 md:px-3 hover:bg-slate-50">
                <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-slate-600" />
                </div>
                <span className="hidden sm:inline-block text-sm font-medium text-slate-700">
                  {currentUser?.firstName || "Usuario"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="flex flex-col gap-1">
                <span>{currentUser?.firstName} {currentUser?.lastName}</span>
                <span className="font-normal text-xs text-muted-foreground">{currentUser?.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
