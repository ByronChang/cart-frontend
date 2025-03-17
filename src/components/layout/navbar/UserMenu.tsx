
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  closeMenu?: () => void;
  isMobile?: boolean;
}

export const UserMenu = ({ closeMenu, isMobile = false }: UserMenuProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
    if (closeMenu) closeMenu();
  };

  if (isMobile) {
    return (
      <>
        <Link
          to="/profile"
          className="text-gray-700 hover:text-primary transition-colors py-2 flex items-center"
          onClick={closeMenu}
        >
          <User size={20} className="mr-2" /> Mi Perfil
        </Link>
        <Link
          to="/orders"
          className="text-gray-700 hover:text-primary transition-colors py-2 flex items-center"
          onClick={closeMenu}
        >
          <Package size={20} className="mr-2" /> Mis Pedidos
        </Link>
        <button
          onClick={handleLogout}
          className="text-gray-700 hover:text-primary transition-colors py-2 flex items-center w-full text-left"
        >
          <LogOut size={20} className="mr-2" /> Cerrar Sesión
        </button>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center focus:outline-none">
        <Button variant="ghost" className="p-0 flex items-center gap-1 h-auto">
          <User size={20} className="text-gray-700" />
          <span className="text-gray-700">{user?.username?.split(' ')[0]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/profile")}>
          Mi Perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/orders")}>
          Mis Pedidos
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
