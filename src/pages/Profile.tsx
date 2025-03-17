
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { User } from "@/types";
import { toast } from "@/components/ui/use-toast";

// Esquema de validación
const profileSchema = z.object({
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  email: z.string().email("Ingrese un correo electrónico válido").readonly(),
  birthDate: z.string(),
  address: z.string().min(10, "La dirección debe tener al menos 10 caracteres"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<User | null>(null);

  // Inicializar formulario
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      email: "",
      birthDate: "",
      address: "",
    },
  });

  // Cargar datos del perfil
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token || !user?.email) return;
      
      setIsLoading(true);
      try {
        const userData = await fetchApi<User>(`/users/${user.email}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setProfileData(userData);
        
        // Actualizar el formulario con los datos del usuario
        form.reset({
          username: userData.username || "",
          email: userData.email || "",
          birthDate: userData.birthDate || "",
          address: userData.address || "",
        });
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("No se pudo cargar la información del perfil.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [token, user, form]);

  // Redireccionar si no está autenticado
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate, isLoading]);

  // Envío del formulario
  const onSubmit = async (data: ProfileFormValues) => {
    if (!token || !profileData?.id) return;
    
    setError(null);
    setIsLoading(true);
    
    try {
      // Utilizamos el ID en lugar del correo electrónico para la actualización del perfil
      const updatedUser = await fetchApi<User>(`/users/${profileData.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: data.username,
          address: data.address,
        }),
      });
      
      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido actualizada correctamente.",
      });
      
      // Actualizar formulario con datos nuevos
      setProfileData(updatedUser);
      form.reset({
        ...data,
        username: updatedUser.username,
        address: updatedUser.address,
      });
    } catch (err) {
      console.error("Profile update error:", err);
      setError("No se pudo actualizar el perfil. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null; // No renderizar nada mientras redirige
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Mi Perfil</CardTitle>
            <CardDescription className="text-center">
              Actualiza tu información personal
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLoading && !profileData ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de Usuario</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Tu nombre de usuario"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo Electrónico</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              disabled={true}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-gray-500">El correo electrónico no se puede cambiar</p>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Nacimiento</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              disabled={true}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-gray-500">La fecha de nacimiento no se puede cambiar</p>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Calle, número, colonia, ciudad, estado, código postal"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar Cambios"
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
