
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Cart, CartItem, Product } from "@/types";
import { fetchApi } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

interface CartState extends Cart {
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
};

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
};

interface CartAPIResponse {
  user?: {
    id: number;
    email: string;
    address: string;
    birthDate: string;
    username: string;
  };
  products: Array<{
    product: {
      id: number;
      name: string;
      description: string;
      price: number;
      imageUrl: string;
      quantity?: number;
    };
    quantity: number;
    addedDate: string;
  }>;
}

const transformResponseToCart = (response: CartAPIResponse): Cart => {
  if (!response || !response.products) {
    return { items: [], total: 0 };
  }

  const items: CartItem[] = response.products.map(item => ({
    product: {
      id: String(item.product.id),
      name: item.product.name,
      description: item.product.description,
      price: item.product.price,
      imageUrl: item.product.imageUrl,
      quantity: item.product.quantity || 999,
      category: undefined
    },
    quantity: item.quantity
  }));
  
  const total = calculateTotal(items);
  
  return { items, total };
};

export const fetchUserCart = createAsyncThunk(
  "cart/fetchUserCart",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetchApi<CartAPIResponse>(`/cart/user/${userId}`);
      
      const transformedCart = transformResponseToCart(response);
      
      return transformedCart;
    } catch (error) {
      if (error && typeof error === 'object' && 'statusCode' in error && (error.statusCode !== 404)) {
        return rejectWithValue(error);
      }
      return { items: [], total: 0 } as Cart;
    }
  }
);

export const addItemToCart = createAsyncThunk(
  "cart/addItem",
  async ({ userId, product, quantity }: { userId: string; product: Product; quantity: number }) => {
    const response = await fetchApi<Cart>(`/cart`, {
      method: "POST",
      body: JSON.stringify({
        userId,
        productId: product.id,
        quantity,
      }),
    });
    
    return { response, addedProduct: { product, quantity } };
  }
);

export const updateCartItemQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async ({ 
    userId, 
    productId, 
    quantity 
  }: { 
    userId: string; 
    productId: string; 
    quantity: number 
  }, { rejectWithValue, dispatch }) => {
    try {
      const numericProductId = parseInt(productId);
      
      const response = await fetchApi<CartAPIResponse>(
        `/cart/user/${userId}/product/${numericProductId}?quantity=${quantity}&productId=${numericProductId}&userId=${userId}`, 
        {
          method: "PUT",
        }
      );
      
      if (response) {
        dispatch(fetchUserCart(userId));
      }
      
      const transformedCart = transformResponseToCart(response);
      return transformedCart;
    } catch (error) {
      toast({
        title: "Error al actualizar cantidad",
        description: "No se pudo actualizar la cantidad del producto. Intente nuevamente.",
        variant: "destructive",
      });
      return rejectWithValue(error);
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "cart/removeItem",
  async ({ userId, productId }: { userId: string; productId: string }) => {
    await fetchApi(`/cart/user/${userId}/product/${productId}`, {
      method: "DELETE",
    });
    
    return productId;
  }
);

export const clearUserCart = createAsyncThunk(
  "cart/clearCart",
  async (userId: string) => {
    await fetchApi(`/cart/user/${userId}`, {
      method: "DELETE",
    });
    
    return;
  }
);

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<Cart>) => {
      state.items = action.payload.items || [];
      state.total = calculateTotal(action.payload.items || []);
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },
    forceCartUpdate: (state) => {}
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserCart.fulfilled, (state, action) => {
        const validItems = Array.isArray(action.payload.items) ? action.payload.items : [];
        
        state.loading = false;
        state.items = validItems;
        state.total = calculateTotal(validItems);
        
        if (validItems.length > 0) {
          toast({
            title: "Carrito actualizado",
            description: `${validItems.length} producto(s) en tu carrito`
          });
        }
      })
      .addCase(fetchUserCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch cart";
      })
      
      .addCase(addItemToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.loading = false;
        
        if (action.payload.response.items) {
          state.items = action.payload.response.items;
          state.total = calculateTotal(action.payload.response.items);
        } else {
          const { product, quantity } = action.payload.addedProduct;
          const existingItemIndex = state.items.findIndex(
            (item) => item.product.id === product.id
          );

          if (existingItemIndex > -1) {
            state.items[existingItemIndex].quantity += quantity;
          } else {
            state.items.push({ product, quantity });
          }
          
          state.total = calculateTotal(state.items);
        }
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to add item to cart";
      })
      
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.loading = false;
        
        if (action.payload && action.payload.items && action.payload.items.length > 0) {
          state.items = action.payload.items;
          state.total = calculateTotal(action.payload.items);
        }
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update quantity";
      })
      
      .addCase(removeCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.product.id !== action.payload);
        state.total = calculateTotal(state.items);
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to remove item from cart";
      })
      
      .addCase(clearUserCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearUserCart.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.total = 0;
      })
      .addCase(clearUserCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to clear cart";
      });
  },
});

export const { setCart, clearCart, forceCartUpdate } = cartSlice.actions;
export default cartSlice.reducer;
