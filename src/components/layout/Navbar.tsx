
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { fetchUserCart, forceCartUpdate } from "@/store/slices/cartSlice";
import { UserMenu } from "./navbar/UserMenu";
import { CartButton } from "./navbar/CartButton";
import { MobileMenu } from "./navbar/MobileMenu";

const Navbar = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const cartLoading = useAppSelector((state) => state.cart.loading);
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      console.log("Navbar: cargando carrito para usuario:", user.id, "en ruta:", location.pathname, "a las", new Date().toISOString());
      dispatch(fetchUserCart(user.id))
        .unwrap()
        .then((cart) => {
          console.log("Navbar: carrito cargado con éxito:", cart);
          dispatch(forceCartUpdate());
        })
        .catch((error) => {
          console.error("Navbar: error al cargar el carrito:", error);
        });
    }
  }, [isAuthenticated, user, dispatch, location.pathname]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-white shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">
          SportStore
        </Link>

        <button
          className="md:hidden text-gray-700 focus:outline-none"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-primary transition-colors">
            Inicio
          </Link>
          <Link to="/products" className="text-gray-700 hover:text-primary transition-colors">
            Productos
          </Link>
          
          {isAuthenticated ? (
            <>
              <UserMenu />
              <CartButton itemCount={itemCount} loading={cartLoading} />
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Registrarse</Button>
              </Link>
            </>
          )}
        </div>

        <MobileMenu 
          isOpen={isMenuOpen} 
          closeMenu={closeMenu} 
          cartItemCount={itemCount} 
          cartLoading={cartLoading} 
        />
      </div>
    </nav>
  );
};

export default Navbar;
