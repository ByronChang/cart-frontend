
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserMenu } from "./UserMenu";
import { CartButton } from "./CartButton";

interface MobileMenuProps {
  isOpen: boolean;
  closeMenu: () => void;
  cartItemCount: number;
  cartLoading: boolean;
}

export const MobileMenu = ({ isOpen, closeMenu, cartItemCount, cartLoading }: MobileMenuProps) => {
  const { isAuthenticated } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-md z-10 py-4">
      <div className="flex flex-col space-y-4 px-4">
        <Link
          to="/"
          className="text-gray-700 hover:text-primary transition-colors py-2"
          onClick={closeMenu}
        >
          Inicio
        </Link>
        <Link
          to="/products"
          className="text-gray-700 hover:text-primary transition-colors py-2"
          onClick={closeMenu}
        >
          Productos
        </Link>
        
        {isAuthenticated ? (
          <>
            <UserMenu closeMenu={closeMenu} isMobile={true} />
            <CartButton 
              itemCount={cartItemCount} 
              loading={cartLoading} 
              closeMenu={closeMenu} 
              isMobile={true} 
            />
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-gray-700 hover:text-primary transition-colors py-2"
              onClick={closeMenu}
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/register"
              className="text-gray-700 hover:text-primary transition-colors py-2"
              onClick={closeMenu}
            >
              Registrarse
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
