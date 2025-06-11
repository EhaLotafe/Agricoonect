import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sprout, Tractor, ShoppingBasket } from "lucide-react";
import { Link, useLocation } from "wouter";
import { insertUserSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/App";
import { z } from "zod";

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const defaultUserType = urlParams.get('type') as 'farmer' | 'buyer' || 'buyer';
  
  const [userType, setUserType] = useState<'farmer' | 'buyer'>(defaultUserType);
  const { setUser } = useAuth();
  const { toast } = useToast();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      userType: userType,
      location: '',
      isActive: true,
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const { confirmPassword, ...userData } = data;
      return await apiRequest('POST', '/api/register', userData);
    },
    onSuccess: async (response) => {
      const user = await response.json();
      setUser(user);
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès!",
      });
      
      // Redirect based on user type
      if (userType === 'farmer') {
        window.location.href = '/farmer/dashboard';
      } else {
        window.location.href = '/buyer/dashboard';
      }
    },
    onError: (error) => {
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur est survenue lors de l'inscription",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate({ ...data, userType });
  };

  return (
    <div className="min-h-screen bg-agri-gray py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
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
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Créer un compte</h2>
            <p className="text-gray-600">Rejoignez notre communauté agricole</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Inscription</CardTitle>
            </CardHeader>
            <CardContent>
              {/* User Type Selection */}
              <Tabs value={userType} onValueChange={(value) => setUserType(value as 'farmer' | 'buyer')} className="mb-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="farmer" className="flex items-center space-x-2">
                    <Tractor className="w-4 h-4" />
                    <span>Agriculteur</span>
                  </TabsTrigger>
                  <TabsTrigger value="buyer" className="flex items-center space-x-2">
                    <ShoppingBasket className="w-4 h-4" />
                    <span>Acheteur</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="farmer" className="mt-4">
                  <div className="bg-agri-green/10 border border-agri-green/20 rounded-lg p-4">
                    <h3 className="font-semibold text-agri-green mb-2">Compte Agriculteur</h3>
                    <p className="text-sm text-gray-600">
                      Vendez vos produits directement aux consommateurs, gérez votre stock et développez votre activité.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="buyer" className="mt-4">
                  <div className="bg-agri-orange/10 border border-agri-orange/20 rounded-lg p-4">
                    <h3 className="font-semibold text-agri-orange mb-2">Compte Acheteur</h3>
                    <p className="text-sm text-gray-600">
                      Achetez des produits frais directement auprès des producteurs locaux et soutenez l'agriculture congolaise.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Registration Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre prénom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre nom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom d'utilisateur *</FormLabel>
                        <FormControl>
                          <Input placeholder="Choisissez un nom d'utilisateur" {...field} />
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
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="votre@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input placeholder="+243 XXX XXX XXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localisation</FormLabel>
                        <FormControl>
                          <Input placeholder="Ville, commune..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mot de passe *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Mot de passe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmer le mot de passe *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirmer le mot de passe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-agri-orange hover:bg-agri-orange/90"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Création en cours..." : "Créer mon compte"}
                  </Button>
                </form>
              </Form>

              {/* Login Link */}
              <div className="text-center mt-6">
                <p className="text-gray-600">
                  Vous avez déjà un compte ?{" "}
                  <Link href="/login">
                    <span className="text-agri-green hover:underline cursor-pointer font-semibold">
                      Connectez-vous
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
