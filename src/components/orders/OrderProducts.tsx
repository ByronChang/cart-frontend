
import { Order } from "@/types";

interface OrderProductsProps {
  items: Order['items'];
}

export const OrderProducts = ({ items }: OrderProductsProps) => {
  if (!items || items.length === 0) {
    return <p className="text-gray-500">No hay productos en este pedido.</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const itemPrice = item.price || 0;
        const itemQuantity = item.quantity || 0;
        const itemTotal = itemPrice * itemQuantity;

        return (
          <div key={item.productId} className="flex justify-between pb-4 border-b last:border-0 last:pb-0">
            <div>
              <p className="font-medium">{item.productName}</p>
              <p className="text-sm text-gray-500">
                Cantidad: {itemQuantity} x ${itemPrice.toFixed(2)}
              </p>
            </div>
            <p className="font-medium">${itemTotal.toFixed(2)}</p>
          </div>
        );
      })}
    </div>
  );
};
