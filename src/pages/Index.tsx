
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchProducts } from "@/store/slices/productSlice";
import { Button } from "@/components/ui/button";
import { ChevronRight, ShoppingBag } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";

const Index = () => {
  const dispatch = useAppDispatch();
  const { products, loading, error } = useAppSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const featuredProducts = products.slice(0, 8);

  return (
    <div>
      <section className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Equípate para el éxito deportivo
            </h1>
            <p className="text-lg md:text-xl mb-8">
              Descubre nuestra selección de artículos deportivos de alta calidad para
              elevar tu rendimiento y disfrutar de tus actividades favoritas.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Ver Productos
                </Button>
              </Link>
              <Link to="/register">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="text-primary-foreground bg-gray-700 hover:bg-gray-800"
                >
                  <ShoppingBag className="mr-2 h-5 w-5" /> Crear una cuenta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Productos Destacados</h2>
            <Link
              to="/products"
              className="text-primary font-medium inline-flex items-center"
            >
              Ver todos <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando productos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Error al cargar los productos. Por favor, intenta de nuevo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
