
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { 
  fetchUserCart, 
  removeCartItem, 
  updateCartItemQuantity, 
  clearUserCart,
  forceCartUpdate
} from "@/store/slices/cartSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { Trash2, Minus, Plus, ShoppingCart, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const Cart = () => {
  const { items, total, loading, error } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      dispatch(fetchUserCart(user.id))
        .unwrap()
        .then(() => {
          dispatch(forceCartUpdate());
        })
        .catch(() => {});
    }
  }, [isAuthenticated, user, dispatch]);

  const handleRemoveItem = (productId: string) => {
    if (!user?.id) return;
    
    dispatch(removeCartItem({
      userId: user.id,
      productId: productId
    })).unwrap()
    .then(() => {
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado del carrito.",
      });
    })
    .catch(() => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto. Intente nuevamente.",
        variant: "destructive",
      });
    });
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (!user?.id) {
      return;
    }
    
    const item = items.find((item) => item.product.id === productId);
    
    if (!item) {
      return;
    }
    
    if (isUpdating) {
      return;
    }
    
    if (newQuantity < 1) {
      newQuantity = 1;
    } else if (newQuantity > item.product.quantity) {
      newQuantity = item.product.quantity;
    }
    
    setIsUpdating(true);
    
    dispatch(updateCartItemQuantity({
      userId: user.id,
      productId,
      quantity: newQuantity
    })).unwrap()
    .then(() => {})
    .catch(() => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la cantidad. Intente nuevamente.",
        variant: "destructive",
      });
    })
    .finally(() => {
      setTimeout(() => {
        setIsUpdating(false);
      }, 300);
    });
  };

  const decreaseQuantity = (productId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      handleUpdateQuantity(productId, currentQuantity - 1);
    }
  };

  const increaseQuantity = (productId: string, currentQuantity: number, maxQuantity: number) => {
    if (currentQuantity < maxQuantity) {
      handleUpdateQuantity(productId, currentQuantity + 1);
    } else {
      toast({
        title: "Cantidad máxima",
        description: "Has alcanzado la cantidad máxima disponible para este producto",
        variant: "destructive",
      });
    }
  };

  const handleClearCart = () => {
    if (!user?.id) return;
    
    dispatch(clearUserCart(user.id)).unwrap()
    .then(() => {
      toast({
        title: "Carrito vaciado",
        description: "Todos los productos han sido eliminados del carrito.",
      });
    })
    .catch(() => {
      toast({
        title: "Error",
        description: "No se pudo vaciar el carrito. Intente nuevamente.",
        variant: "destructive",
      });
    });
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      toast({
        title: "Iniciar sesión requerido",
        description: "Por favor, inicia sesión para continuar con el proceso de compra.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    navigate("/checkout");
  };

  if (loading && items.length === 0) {
    return (
      <div className="container mx-auto py-16 px-4 flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-gray-600 mb-4">Cargando carrito...</p>
          <p className="text-gray-500 text-sm">
            Estado de Redux: {items.length} items, total: ${total.toFixed(2)}
          </p>
        </div>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="container mx-auto py-16 px-4 flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center text-center">
          <p className="text-red-500 mb-4">Error al cargar el carrito: {error}</p>
          <p className="text-gray-500 text-sm mb-4">
            Estado de Redux: {items.length} items, total: ${total.toFixed(2)}
          </p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Tu Carrito</h1>
          </div>
          <div className="bg-gray-50 p-8 rounded-lg">
            <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-6">Parece que aún no has añadido productos a tu carrito.</p>
            <Button asChild>
              <Link to="/products">Ver Productos</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tu Carrito</h1>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={item.product.id} className="bg-white rounded-lg shadow-sm p-4 border">
              <div className="flex items-center gap-4">
                <Link to={`/products/${item.product.id}`} className="shrink-0">
                  <img 
                    src={item.product.imageUrl || "/placeholder.svg"} 
                    alt={item.product.name} 
                    className="w-20 h-20 object-cover rounded-md"
                  />
                </Link>
                
                <div className="flex-grow min-w-0">
                  <Link to={`/products/${item.product.id}`} className="hover:text-primary transition-colors">
                    <h3 className="font-medium text-lg truncate">{item.product.name}</h3>
                  </Link>
                  <div className="text-primary font-medium">${item.product.price.toFixed(2)}</div>
                </div>
                
                <div className="shrink-0 space-y-2">
                  <div className="flex items-center border rounded-md">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => decreaseQuantity(item.product.id, item.quantity)}
                      disabled={isUpdating || item.quantity <= 1}
                      className="h-8 w-8 rounded-none rounded-l-md"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value)) {
                          handleUpdateQuantity(item.product.id, value);
                        }
                      }}
                      min="1"
                      max={item.product.quantity}
                      className="h-8 w-12 text-center border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => increaseQuantity(item.product.id, item.quantity, item.product.quantity)}
                      disabled={isUpdating || item.quantity >= item.product.quantity}
                      className="h-8 w-8 rounded-none rounded-r-md"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.product.id)}
                    disabled={isUpdating}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {items.length > 0 && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={handleClearCart}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                disabled={isUpdating || loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Vaciar Carrito
              </Button>
            </div>
          )}
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow-sm p-6 border sticky top-24">
            <h2 className="text-xl font-bold mb-4">Resumen de compra</h2>
            
            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.product.name} ({item.quantity})
                  </span>
                  <span className="font-medium">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between font-semibold text-lg mb-6">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            
            <Button 
              onClick={handleProceedToCheckout} 
              className="w-full mb-2 flex items-center justify-center gap-2"
              disabled={loading || isUpdating}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  Proceder al Pago
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              asChild 
              className="w-full"
              disabled={loading || isUpdating}
            >
              <Link to="/products">Seguir Comprando</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
