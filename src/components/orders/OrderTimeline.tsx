
import { OrderStatus } from "@/types";
import { ShoppingBag, Package, Truck, CheckCircle, XCircle } from "lucide-react";

interface OrderTimelineProps {
  status: OrderStatus;
}

export const OrderTimeline = ({ status }: OrderTimelineProps) => {
  const steps = [
    { title: "Pedido Recibido", icon: <ShoppingBag className="h-5 w-5" />, completed: true },
    { 
      title: "Procesando", 
      icon: <Package className="h-5 w-5" />, 
      completed: [
        OrderStatus.PROCESSING, 
        OrderStatus.SHIPPED, 
        OrderStatus.DELIVERED
      ].includes(status)
    },
    { 
      title: "En Camino", 
      icon: <Truck className="h-5 w-5" />, 
      completed: [
        OrderStatus.SHIPPED, 
        OrderStatus.DELIVERED
      ].includes(status) 
    },
    { 
      title: "Entregado", 
      icon: <CheckCircle className="h-5 w-5" />, 
      completed: status === OrderStatus.DELIVERED 
    },
  ];

  if (status === OrderStatus.CANCELLED) {
    return (
      <div className="flex items-center justify-center gap-2 py-4 bg-red-50 rounded-md text-red-700 font-medium">
        <XCircle className="h-5 w-5" />
        Pedido Cancelado
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="relative flex justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center z-10">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center
                ${step.completed 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-400'
                }`}
            >
              {step.icon}
            </div>
            <p className={`mt-2 text-xs font-medium text-center max-w-[80px]
              ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}
            >
              {step.title}
            </p>
          </div>
        ))}
        
        {/* Línea de progreso */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
          <div 
            className="absolute top-0 left-0 h-0.5 bg-primary"
            style={{ 
              width: status === OrderStatus.PENDING 
                ? '0%' 
                : status === OrderStatus.PROCESSING 
                ? '33%' 
                : status === OrderStatus.SHIPPED 
                ? '66%' 
                : status === OrderStatus.DELIVERED
                ? '100%'
                : '0%'
            }}
          />
        </div>
      </div>
    </div>
  );
};
