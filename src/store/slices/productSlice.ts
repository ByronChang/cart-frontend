
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types";
import { fetchApi } from "@/lib/api";
import { RootState } from "..";

interface ProductState {
  products: Product[];
  filteredProducts: Product[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string | null;
}

const initialState: ProductState = {
  products: [],
  filteredProducts: [],
  loading: false,
  error: null,
  searchQuery: "",
  selectedCategory: null
};

export const fetchProducts = createAsyncThunk("products/fetchProducts", async (_, { rejectWithValue }) => {
  try {
    const products = await fetchApi<Product[]>("/products", {}, false);
    return products;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.filteredProducts = filterProducts(
        state.products,
        action.payload,
        state.selectedCategory
      );
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
      state.filteredProducts = filterProducts(
        state.products,
        state.searchQuery,
        action.payload
      );
    },
    resetFilters: (state) => {
      state.searchQuery = "";
      state.selectedCategory = null;
      state.filteredProducts = state.products;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
        state.filteredProducts = filterProducts(
          action.payload, 
          state.searchQuery,
          state.selectedCategory
        );
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error al cargar los productos";
      });
  },
});

const filterProducts = (
  products: Product[],
  searchQuery: string,
  category: string | null
): Product[] => {
  return products.filter((product) => {
    const matchesSearch = searchQuery
      ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
      
    const matchesCategory = category
      ? product.category === category
      : true;
      
    return matchesSearch && matchesCategory;
  });
};

export const selectProductById = (state: RootState, productId: string | undefined) => {
  if (!productId) return null;
  
  const product = state.products.products.find(product => String(product.id) === String(productId));
  
  return product;
};

export const { setSearchQuery, setSelectedCategory, resetFilters } = productSlice.actions;
export default productSlice.reducer;
