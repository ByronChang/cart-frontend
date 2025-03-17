
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { clearUserCart } from "@/store/slices/cartSlice";
import { createOrder } from "@/store/slices/orderSlice";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const checkoutSchema = z.object({
  shippingAddress: z.string().min(10, "La dirección debe tener al menos 10 caracteres"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAuth();
  const { items, total } = useAppSelector((state) => state.cart);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: user?.address || "",
    },
  });

  useEffect(() => {
    if (user?.address) {
      form.setValue("shippingAddress", user.address);
    }
  }, [user, form]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (items.length === 0) {
      navigate("/cart");
    }
  }, [isAuthenticated, items.length, navigate]);

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!user || items.length === 0) return;
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      const orderItems = items.map(item => ({
        productId: parseInt(item.product.id),
        quantity: item.quantity,
      }));
      
      const orderPayload = {
        userId: user.id,
        items: orderItems,
        shippingAddress: data.shippingAddress,
      };
      
      const resultAction = await dispatch(createOrder(orderPayload)).unwrap();
      
      dispatch(clearUserCart(user.id));
      
      toast({
        title: "¡Pedido realizado con éxito!",
        description: "Tu pedido ha sido procesado correctamente.",
        variant: "default",
      });
      
      navigate(`/order-success/${resultAction.id}`);
    } catch (err) {
      setError("No se pudo procesar el pedido. Por favor, intenta de nuevo.");
      toast({
        title: "Error al procesar el pedido",
        description: "Hubo un problema al crear tu pedido. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || items.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Dirección de Envío</CardTitle>
              <CardDescription>
                Confirma la dirección donde quieres recibir tu pedido
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="shippingAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección de Envío</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Calle, número, colonia, ciudad, estado, código postal"
                            disabled={isSubmitting}
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full flex items-center gap-2" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        Confirmar Pedido
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="shrink-0">
                      <img 
                        src={item.product.imageUrl || "/placeholder.svg"} 
                        alt={item.product.name} 
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Cantidad: {item.quantity}</span>
                        <span className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}

                <Separator />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
