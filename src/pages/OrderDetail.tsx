
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import { Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, Clock } from "lucide-react";
import { formatDate } from "@/lib/date";
import { formatOrderId } from "@/lib/utils";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { OrderProducts } from "@/components/orders/OrderProducts";
import { OrderSummary } from "@/components/orders/OrderSummary";

const OrderDetail = () => {
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
            Volver a Mis Pedidos
          </Button>
        </div>
      </div>
    );
  }

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
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => navigate("/orders")} className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Volver a Mis Pedidos
          </Button>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-gray-500">
              Pedido realizado el {formatDate(order.createdAt)}
            </span>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-6">
          Pedido #{formatOrderId(order.id)}
        </h1>

        <Card className="mb-8">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg">Estado del Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderTimeline status={order.status} />
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderProducts items={order.items} />

                <Separator className="my-4" />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${displayTotal.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Información del Envío</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{order.shippingAddress || 'Dirección no disponible'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumen</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderSummary order={order} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
