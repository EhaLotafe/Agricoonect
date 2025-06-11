import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertProductSchema, type Product } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/App";
import { z } from "zod";

const productFormSchema = insertProductSchema.omit({ farmerId: true });

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product;
  onSuccess?: () => void;
}

export default function ProductForm({ product, onSuccess }: ProductFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: provinces } = useQuery({
    queryKey: ['/api/provinces'],
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      category: product?.category || '',
      price: product?.price || '',
      unit: product?.unit || '',
      quantity: product?.quantity || 0,
      availableQuantity: product?.availableQuantity || 0,
      saleMode: product?.saleMode || 'direct',
      location: product?.location || '',
      province: product?.province || '',
      images: product?.images || [],
      isActive: product?.isActive ?? true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      if (!user) throw new Error("User not authenticated");

      const productData = {
        ...data,
        farmerId: user.id,
        availableQuantity: data.quantity, // Set available quantity equal to total quantity
      };

      if (product) {
        return await apiRequest('PUT', `/api/products/${product.id}`, productData);
      } else {
        return await apiRequest('POST', '/api/products', productData);
      }
    },
    onSuccess: () => {
      toast({
        title: product ? "Produit mis à jour" : "Produit créé",
        description: product 
          ? "Votre produit a été mis à jour avec succès!" 
          : "Votre produit a été créé avec succès!",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: [`/api/farmer/${user?.id}/products`] });
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (!product) {
        form.reset();
      }
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    mutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {product ? "Modifier le produit" : "Ajouter un nouveau produit"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du produit *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Tomates fraîches" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category: string) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Décrivez votre produit..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price and Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unité *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Unité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="pièce">pièce</SelectItem>
                        <SelectItem value="sac">sac</SelectItem>
                        <SelectItem value="litre">litre</SelectItem>
                        <SelectItem value="régime">régime</SelectItem>
                        <SelectItem value="botte">botte</SelectItem>
                        <SelectItem value="tas">tas</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une province" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {provinces?.map((province: string) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localisation précise *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Kimbanseke, Marché central" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Sale Mode */}
            <FormField
              control={form.control}
              name="saleMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mode de vente *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="direct">
                        Vente directe - Les acheteurs peuvent commander immédiatement
                      </SelectItem>
                      <SelectItem value="contact">
                        Mise en relation - Les acheteurs vous contactent d'abord
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-agri-green hover:bg-agri-green/90"
              disabled={mutation.isPending}
            >
              {mutation.isPending 
                ? (product ? "Mise à jour..." : "Création...") 
                : (product ? "Mettre à jour" : "Créer le produit")
              }
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
