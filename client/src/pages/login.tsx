import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Sprout } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/App";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const { setUser } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      return await apiRequest('POST', '/api/login', data);
    },
    onSuccess: async (response) => {
      const user = await response.json();
      setUser(user);
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur Agri-Connect RDC!",
      });
      
      // Redirect based on user type
      if (user.userType === 'farmer') {
        window.location.href = '/farmer/dashboard';
      } else if (user.userType === 'admin') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/buyer/dashboard';
      }
    },
    onError: (error) => {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Email ou mot de passe incorrect",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-agri-gray py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-agri-green rounded-full flex items-center justify-center">
                  <Sprout className="text-white text-xl" />
                </div>
                <h1 className="text-2xl font-bold text-agri-green">Agri-Connect RDC</h1>
              </div>
            </Link>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Connexion</h2>
            <p className="text-gray-600">Accédez à votre compte</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Se connecter</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="votre@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Votre mot de passe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-agri-green hover:bg-agri-green/90"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Connexion..." : "Se connecter"}
                  </Button>
                </form>
              </Form>

              {/* Register Link */}
              <div className="text-center mt-6">
                <p className="text-gray-600">
                  Vous n'avez pas de compte ?{" "}
                  <Link href="/register">
                    <span className="text-agri-orange hover:underline cursor-pointer font-semibold">
                      Inscrivez-vous
                    </span>
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
