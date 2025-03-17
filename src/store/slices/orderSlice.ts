
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Order } from "@/types";
import { fetchApi } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
};

export const fetchUserOrders = createAsyncThunk(
  "orders/fetchUserOrders", 
  async (userId: string) => {
    const response = await fetchApi<Order[]>(`/orders/user/${userId}`);
    return response;
  }
);

export const fetchOrderById = createAsyncThunk(
  "orders/fetchOrderById",
  async (orderId: string) => {
    const response = await fetchApi<Order>(`/orders/${orderId}`);
    return response;
  }
);

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData: {
    userId: string;
    items: Array<{ productId: number; quantity: number }>;
    shippingAddress: string;
  }) => {
    try {
      const response = await fetchApi<Order>("/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });
      
      toast({
        title: "Pedido creado",
        description: `Pedido #${response.id} creado correctamente`,
      });
      
      return response;
    } catch (error) {
      toast({
        title: "Error al crear pedido",
        description: "No se pudo crear el pedido. Intente nuevamente.",
        variant: "destructive",
      });
      throw error;
    }
  }
);

export const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch orders";
      })
      
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch order";
      })
      
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.orders = [action.payload, ...state.orders];
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create order";
      });
  },
});

export const { clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
