
import { Link } from "react-router-dom";
import { ShoppingCart, Loader2 } from "lucide-react";

interface CartButtonProps {
  itemCount: number;
  loading: boolean;
  closeMenu?: () => void;
  isMobile?: boolean;
}

export const CartButton = ({ itemCount, loading, closeMenu, isMobile = false }: CartButtonProps) => {
  if (isMobile) {
    return (
      <Link
        to="/cart"
        className="text-gray-700 hover:text-primary transition-colors py-2 flex items-center"
        onClick={closeMenu}
      >
        <ShoppingCart size={20} className="mr-2" /> 
        Carrito
        {!loading && itemCount > 0 && (
          <span className="ml-2 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link to="/cart" className="relative text-gray-700 hover:text-primary transition-colors">
      {loading ? (
        <Loader2 size={20} className="animate-spin" />
      ) : (
        <>
          <ShoppingCart size={20} />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </>
      )}
    </Link>
  );
};
