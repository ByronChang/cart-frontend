import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Loader2, 
  ShoppingBag, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle,
  ArrowRight 
} from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useDispatch } from "react-redux";
import { useRedux } from "@/hooks/useRedux";
import { fetchUserOrders } from "@/store/slices/orderSlice";
import { Order, OrderStatus } from "@/types";
import { formatOrderId } from "@/lib/utils";

const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  let icon;
  let colorClass;
  
  switch (status) {
    case OrderStatus.PENDING:
      icon = <ShoppingBag className="h-4 w-4" />;
      colorClass = "bg-yellow-100 text-yellow-800";
      break;
    case OrderStatus.PROCESSING:
      icon = <Package className="h-4 w-4" />;
      colorClass = "bg-blue-100 text-blue-800";
      break;
    case OrderStatus.SHIPPED:
      icon = <Truck className="h-4 w-4" />;
      colorClass = "bg-indigo-100 text-indigo-800";
      break;
    case OrderStatus.DELIVERED:
      icon = <CheckCircle className="h-4 w-4" />;
      colorClass = "bg-green-100 text-green-800";
      break;
    case OrderStatus.CANCELLED:
      icon = <XCircle className="h-4 w-4" />;
      colorClass = "bg-red-100 text-red-800";
      break;
    default:
      icon = <ShoppingBag className="h-4 w-4" />;
      colorClass = "bg-gray-100 text-gray-800";
  }
  
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {icon}
      {status}
    </span>
  );
};

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

const OrderCard = ({ order }: { order: Order }) => {
  const calculatedTotal = order.items?.reduce((sum, item) => {
    const itemPrice = item.price || 0;
    const itemQuantity = item.quantity || 0;
    return sum + (itemPrice * itemQuantity);
  }, 0) || 0;
  
  const displayTotal = order.total !== undefined && order.total !== null 
    ? order.total 
    : calculatedTotal;

  return (
    <Card key={order.id} className="overflow-hidden">
      <div className="sm:flex sm:items-center sm:justify-between p-6 border-b">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-lg font-semibold">
            Pedido #{formatOrderId(order.id)}
          </h2>
          <p className="text-sm text-gray-500">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <OrderStatusBadge status={order.status} />
          <Button asChild variant="outline" size="sm">
            <Link to={`/orders/${order.id}`} className="flex items-center gap-1">
              Detalles
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total</span>
            <span className="font-semibold">
              ${displayTotal.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Productos</span>
            <span className="text-gray-600">{order.items ? order.items.length : 0} artículos</span>
          </div>
          <div className="border-t pt-3 mt-3">
            <h3 className="text-sm font-medium mb-1">Productos:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              {order.items && order.items.slice(0, 3).map((item) => (
                <li key={item.productId} className="truncate">
                  {item.quantity}x {item.productName}
                </li>
              ))}
              {order.items && order.items.length > 3 && (
                <li className="text-primary">
                  <Link to={`/orders/${order.id}`}>
                    + {order.items.length - 3} más
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const NoOrders = () => (
  <div className="max-w-3xl mx-auto bg-gray-50 p-8 rounded-lg text-center">
    <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
    <h2 className="text-xl font-semibold mb-2">No tienes pedidos</h2>
    <p className="text-gray-600 mb-6">
      Aún no has realizado ningún pedido. ¡Explora nuestros productos y realiza tu primera compra!
    </p>
    <Button asChild>
      <Link to="/products">Ver Productos</Link>
    </Button>
  </div>
);

const Orders = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const { orders, loading: isLoading, error } = useRedux(state => state.orders);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (user?.id) {
      dispatch(fetchUserOrders(user.id) as any);
    }
  }, [user, isAuthenticated, navigate, dispatch]);

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-3xl mx-auto bg-red-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Intentar de nuevo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Mis Pedidos</h1>
      
      {orders.length === 0 ? (
        <NoOrders />
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
