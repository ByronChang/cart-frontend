
import { Order } from "@/types";
import { formatOrderId } from "@/lib/utils";
import { formatDateWithPattern } from "@/lib/date";

interface OrderSummaryProps {
  order: Order;
}

export const OrderSummary = ({ order }: OrderSummaryProps) => {
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
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-500">ID del Pedido</span>
        <span className="font-medium">{formatOrderId(order.id)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">Fecha</span>
        <span className="font-medium">{formatDateWithPattern(order.createdAt)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">Total</span>
        <span className="font-medium">${displayTotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">Productos</span>
        <span className="font-medium">{order.items ? order.items.length : 0}</span>
      </div>
    </div>
  );
};
