
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addItemToCart } from "@/store/slices/cartSlice";
import { Loader2, Minus, Plus, ShoppingCart, ArrowLeft } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { fetchProducts, selectProductById } from "@/store/slices/productSlice";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAuth();
  
  const hasProducts = useAppSelector((state) => state.products.products.length > 0);
  const isLoadingProducts = useAppSelector((state) => state.products.loading);
  const productFromState = useAppSelector((state) => selectProductById(state, id));
  
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const loadProductData = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }
      
      if (!hasProducts && !isLoadingProducts) {
        try {
          await dispatch(fetchProducts()).unwrap();
        } catch (error) {
          toast({
            title: "Error",
            description: "No se pudieron cargar los productos. Intente nuevamente.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(isLoadingProducts);
      }
    };

    loadProductData();
  }, [id, dispatch, hasProducts, isLoadingProducts]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) {
      setQuantity(1);
    } else if (productFromState && value > productFromState.quantity) {
      setQuantity(productFromState.quantity);
    } else {
      setQuantity(value);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (productFromState && quantity < productFromState.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = () => {
    if (!productFromState) return;
    
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

    setIsAddingToCart(true);
    
    dispatch(
      addItemToCart({
        userId: user.id,
        product: productFromState,
        quantity,
      })
    ).unwrap()
    .then(() => {
      toast({
        title: "Producto agregado",
        description: `${productFromState.name} se ha agregado a tu carrito.`,
      });
    })
    .catch(() => {
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito. Intente nuevamente.",
        variant: "destructive",
      });
    })
    .finally(() => {
      setIsAddingToCart(false);
    });
  };

  if (isLoading || isLoadingProducts) {
    return (
      <div className="container mx-auto py-16 px-4 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!productFromState) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-3xl mx-auto bg-red-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Producto no encontrado</h2>
          <p className="text-gray-700">
            El producto que estás buscando no existe o ha sido eliminado.
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate("/products")}
          >
            Volver a Productos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate("/products")} 
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Productos
        </Button>
      </div>
      
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg overflow-hidden shadow-md">
            <img
              src={productFromState.imageUrl || "/placeholder.svg"}
              alt={productFromState.name}
              className="w-full h-auto object-cover aspect-square"
            />
          </div>

          <div className="flex flex-col">
            <h1 className="text-3xl font-bold mb-4">{productFromState.name}</h1>
            <div className="text-2xl font-semibold text-primary mb-6">
              ${productFromState.price.toFixed(2)}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              {productFromState.quantity > 0 && (
                <p className="text-sm">
                  Disponibilidad:{" "}
                  <span className="text-green-600 font-medium">
                    {productFromState.quantity} unidades disponibles
                  </span>
                </p>
              )}
              {productFromState.category && (
                <p className="text-sm mt-1">
                  Categoría: <span className="font-medium">{productFromState.category}</span>
                </p>
              )}
            </div>

            <div className="prose prose-sm max-w-none mb-8">
              <p>{productFromState.description}</p>
            </div>

            {productFromState.quantity > 0 && (
              <>
                <div className="flex items-center mb-6">
                  <label htmlFor="quantity" className="mr-4 font-medium">
                    Cantidad:
                  </label>
                  <div className="flex items-center border rounded-md">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1 || isAddingToCart}
                      className="h-9 w-9 rounded-none rounded-l-md"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      id="quantity"
                      value={quantity}
                      onChange={handleQuantityChange}
                      min="1"
                      max={productFromState.quantity}
                      disabled={isAddingToCart}
                      className="h-9 w-16 text-center border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={increaseQuantity}
                      disabled={quantity >= productFromState.quantity || isAddingToCart}
                      className="h-9 w-9 rounded-none rounded-r-md"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={handleAddToCart} 
                  className="flex items-center gap-2"
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Agregando...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      Agregar al Carrito
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
