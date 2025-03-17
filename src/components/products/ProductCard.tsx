
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useAppDispatch } from "@/hooks/useRedux";
import { addItemToCart } from "@/store/slices/cartSlice";
import { Product } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { id, name, description, price, imageUrl, quantity } = product;
  const { isAuthenticated, user } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Adding to cart from card:", name);
    
    if (!isAuthenticated || !user) {
      toast({
        title: "Inicia sesión primero",
        description: "Debes iniciar sesión para agregar productos al carrito",
        variant: "destructive",
        action: (
          <div className="flex flex-col space-y-2 mt-2">
            <p className="text-sm mb-1">¿Deseas iniciar sesión o registrarte?</p>
            <div className="flex space-x-2">
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => navigate("/login")}
              >
                Iniciar Sesión
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => navigate("/register")}
                className="text-primary-foreground bg-gray-700 hover:bg-gray-800"
              >
                Registrarse
              </Button>
            </div>
          </div>
        ),
      });
      return;
    }

    if (quantity <= 0) {
      toast({
        title: "Producto agotado",
        description: "Lo sentimos, este producto está agotado actualmente",
        variant: "destructive",
      });
      return;
    }

    setIsAddingToCart(true);
    
    dispatch(addItemToCart({
      userId: user.id,
      product,
      quantity: 1
    }))
    .unwrap()
    .then(() => {
      toast({
        title: "Producto agregado",
        description: `${name} se ha agregado al carrito`,
      });
    })
    .catch((error) => {
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito",
        variant: "destructive",
      });
      console.error("Error adding to cart:", error);
    })
    .finally(() => {
      setIsAddingToCart(false);
    });
  };

  return (
    <Link to={`/products/${id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg h-full flex flex-col">
        {/* Product Image - Reduced height */}
        <div className="h-36 bg-gray-100 relative overflow-hidden">
          <img
            src={imageUrl || "https://placehold.co/300x200?text=Producto"}
            alt={name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          
          {quantity <= 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">Agotado</span>
            </div>
          )}
        </div>
        
        {/* Product Info - More compact */}
        <div className="p-3 flex-grow flex flex-col">
          <h3 className="font-semibold text-base mb-1 line-clamp-1">{name}</h3>
          <p className="text-gray-600 text-xs mb-2 line-clamp-2">{description}</p>
          
          <div className="flex justify-between items-center mt-auto">
            <span className="text-primary font-bold text-sm">${price.toFixed(2)}</span>
            
            <Button
              size="sm"
              className="rounded-full w-8 h-8 p-0"
              disabled={quantity <= 0 || isAddingToCart}
              onClick={handleAddToCart}
            >
              {isAddingToCart ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ShoppingCart size={14} />
              )}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
