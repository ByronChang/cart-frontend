
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, LoginRequest, RegisterRequest } from "@/types";
import { fetchApi, API_BASE_URL } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { fetchUserCart, clearCart } from "@/store/slices/cartSlice";
import { useAppDispatch } from "@/hooks/useRedux";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.id) {
      setTimeout(() => {
        dispatch(fetchUserCart(user.id))
          .unwrap()
          .then(() => {})
          .catch(() => {});
      }, 100);
    } else if (!user) {
      dispatch(clearCart());
    }
  }, [user, dispatch]);

  const fetchUserProfile = async (authToken: string) => {
    try {
      setIsLoading(true);
      
      const base64Url = authToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const { sub } = JSON.parse(jsonPayload);
      
      const userData = await fetchApi<User>(`/users/${sub}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      
      setUser(userData);
    } catch (error) {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await fetchApi<string | { token: string; user?: User }>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify(data),
        },
        false
      );
      
      let tokenValue: string;
      let currentUser: User | null = null;
      
      if (typeof response === 'string') {
        tokenValue = response;
      } else if (typeof response === 'object' && response.token) {
        tokenValue = response.token;
        
        if (response.user) {
          currentUser = response.user;
          setUser(currentUser);
        }
      } else {
        throw new Error("Formato de respuesta inválido desde el servidor");
      }
      
      setToken(tokenValue);
      localStorage.setItem("token", tokenValue);
      
      if (!currentUser) {
        await fetchUserProfile(tokenValue);
      }
      
      if (currentUser?.id || user?.id) {
        const userId = currentUser?.id || user?.id;
        if (userId) {
          dispatch(fetchUserCart(userId))
            .unwrap()
            .then(() => {})
            .catch(() => {});
        }
      }
      
      toast({
        title: "Inicio de sesión exitoso",
        description: currentUser?.username 
          ? `Bienvenido de nuevo, ${currentUser.username}!`
          : "Bienvenido de nuevo!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Credenciales inválidas. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const payload = {
        id: 0,
        ...data
      };
      
      const response = await fetchApi<{ message: string }>(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        false
      );
      
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada. Ahora puedes iniciar sesión.",
      });
    } catch (error) {
      let errorMessage = "No se pudo crear la cuenta. Por favor, intenta de nuevo.";
      
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    dispatch(clearCart());
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    });
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      await fetchApi<{ message: string }>(
        "/auth/reset-password",
        {
          method: "POST",
          body: JSON.stringify({ email }),
        },
        false
      );
      toast({
        title: "Solicitud enviada",
        description: "Si el correo existe, recibirás instrucciones para restablecer tu contraseña.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar la solicitud. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
