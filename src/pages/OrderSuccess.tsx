
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import { Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle2, ArrowRight, ShoppingBag, Home } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { formatOrderId } from "@/lib/utils";

// Helper function to safely format dates
const formatDate = (dateString?: string) => {
  if (!dateString) {
    return "Fecha no disponible";
  }
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      return "Fecha no disponible";
    }
    return format(date, "PPP", { locale: es });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Fecha no disponible";
  }
};

// Componente para mostrar la información del pedido exitoso
const OrderSuccessInfo = ({ order }: { order: Order }) => {
  // Calcular el total real basado en los items si el total viene como undefined o null
  const calculatedTotal = order.items?.reduce((sum, item) => {
    const itemPrice = item.price || 0;
    const itemQuantity = item.quantity || 0;
    return sum + (itemPrice * itemQuantity);
  }, 0) || 0;
  
  // Usar el total de la orden si está definido, de lo contrario usar el calculado
  const displayTotal = order.total !== undefined && order.total !== null 
    ? order.total 
    : calculatedTotal;

  return (
    <>
      <div className="bg-green-50 rounded-lg p-8 text-center mb-8">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-green-700 mb-2">¡Pedido Realizado con Éxito!</h1>
        <p className="text-gray-600 mb-4">
          Tu pedido #{formatOrderId(order.id)} ha sido recibido y está siendo procesado.
        </p>
        <p className="text-gray-600">
          Te hemos enviado un correo electrónico con los detalles de tu compra.
        </p>
      </div>

      <Card className="p-6 mb-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Detalles del Pedido</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Número de Pedido:</p>
              <p className="font-medium">{formatOrderId(order.id)}</p>
            </div>
            <div>
              <p className="text-gray-500">Fecha:</p>
              <p className="font-medium">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Estado:</p>
              <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {order.status}
              </span>
            </div>
            <div>
              <p className="text-gray-500">Total:</p>
              <p className="font-medium">${displayTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="mb-6">
          <h3 className="font-semibold mb-3">Productos</h3>
          <div className="space-y-4">
            {order.items && order.items.map((item) => {
              const itemPrice = item.price || 0;
              const itemQuantity = item.quantity || 0;
              const itemTotal = itemPrice * itemQuantity;
              
              return (
                <div key={item.productId} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-gray-500">Cantidad: {itemQuantity}</p>
                  </div>
                  <p className="font-medium">${itemTotal.toFixed(2)}</p>
                </div>
              );
            })}
          </div>
        </div>

        <Separator className="my-4" />

        <div>
          <h3 className="font-semibold mb-2">Dirección de Envío</h3>
          <p className="text-gray-700">{order.shippingAddress}</p>
        </div>
      </Card>
    </>
  );
};

const OrderSuccess = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    const fetchOrder = async () => {
      if (!token || !id) return;
      
      try {
        setIsLoading(true);
        const data = await fetchApi<Order>(`/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrder(data);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("No se pudo cargar la información del pedido.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id, token, isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // No renderizar nada mientras redirige
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-3xl mx-auto bg-red-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">{error || "Pedido no encontrado"}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate("/orders")}
          >
            Ver Mis Pedidos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <OrderSuccessInfo order={order} />

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline" className="flex-1">
            <Link to="/" className="flex items-center justify-center gap-2">
              <Home className="h-4 w-4" />
              Volver al Inicio
            </Link>
          </Button>
          <Button asChild className="flex-1">
            <Link to="/orders" className="flex items-center justify-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Ver Mis Pedidos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
