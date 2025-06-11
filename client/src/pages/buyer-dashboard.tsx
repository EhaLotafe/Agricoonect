import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, Star, MapPin, Phone, User, Package } from "lucide-react";
import { useAuth } from "@/App";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export default function BuyerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: [`/api/buyer/${user?.id}/orders`],
    enabled: !!user,
  });

  const reviewForm = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: '',
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      if (!selectedOrder) throw new Error("No order selected");
      
      const reviewData = {
        buyerId: user!.id,
        productId: selectedOrder.product.id,
        farmerId: selectedOrder.farmerId,
        rating: data.rating,
        comment: data.comment,
      };

      return await apiRequest('POST', '/api/reviews', reviewData);
    },
    onSuccess: () => {
      toast({
        title: "Avis ajouté",
        description: "Votre avis a été ajouté avec succès!",
      });
      setShowReviewDialog(false);
      setSelectedOrder(null);
      reviewForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatPrice = (price: string) => {
    return `${parseFloat(price).toLocaleString()} FC`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "En attente", className: "bg-yellow-500" },
      confirmed: { label: "Confirmée", className: "bg-blue-500" },
      delivered: { label: "Livrée", className: "bg-agri-green" },
      cancelled: { label: "Annulée", className: "bg-red-500" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: "bg-gray-500" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const handleReview = (order: any) => {
    setSelectedOrder(order);
    setShowReviewDialog(true);
  };

  const onSubmitReview = (data: ReviewFormData) => {
    reviewMutation.mutate(data);
  };

  const pendingOrders = orders?.filter((o: any) => o.status === 'pending') || [];
  const confirmedOrders = orders?.filter((o: any) => o.status === 'confirmed') || [];
  const deliveredOrders = orders?.filter((o: any) => o.status === 'delivered') || [];

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Accès non autorisé
            </h3>
            <p className="text-gray-600">
              Vous devez être connecté en tant qu'acheteur pour accéder à cette page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Mes Commandes
        </h1>
        <p className="text-gray-600">
          Bienvenue, {user.firstName} {user.lastName}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingOrders.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmées</p>
                <p className="text-2xl font-bold text-gray-900">
                  {confirmedOrders.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-agri-green" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Livrées</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deliveredOrders.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-agri-orange" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total commandes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="pending">En attente</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmées</TabsTrigger>
          <TabsTrigger value="delivered">Livrées</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Toutes mes commandes</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order: any) => (
                    <div key={order.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{order.product.name}</h3>
                          <p className="text-sm text-gray-600">
                            Commande #{order.id} • {format(new Date(order.createdAt), 'dd MMM yyyy', { locale: fr })}
                          </p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Producteur</p>
                          <p className="font-medium">{order.farmer.firstName} {order.farmer.lastName}</p>
                          {order.farmer.phone && (
                            <p className="text-sm text-gray-600 flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {order.farmer.phone}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Quantité</p>
                          <p className="font-medium">{order.quantity} {order.product.unit}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Prix unitaire</p>
                          <p className="font-medium">{formatPrice(order.product.price)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total</p>
                          <p className="font-medium text-agri-orange">{formatPrice(order.totalPrice)}</p>
                        </div>
                      </div>

                      {order.deliveryAddress && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600">Adresse de livraison</p>
                          <p className="text-sm flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {order.deliveryAddress}
                          </p>
                        </div>
                      )}

                      {order.notes && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600">Notes</p>
                          <p className="text-sm bg-gray-50 p-2 rounded">{order.notes}</p>
                        </div>
                      )}

                      {order.status === 'delivered' && (
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReview(order)}
                            className="border-agri-orange text-agri-orange hover:bg-agri-orange hover:text-white"
                          >
                            <Star className="mr-2 h-4 w-4" />
                            Laisser un avis
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Aucune commande
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Vous n'avez pas encore passé de commande.
                  </p>
                  <Button asChild className="bg-agri-green hover:bg-agri-green/90">
                    <a href="/products">Explorer les produits</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Commandes en attente</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingOrders.length > 0 ? (
                <div className="space-y-4">
                  {pendingOrders.map((order: any) => (
                    <div key={order.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{order.product.name}</h3>
                          <p className="text-sm text-gray-600">
                            Commande #{order.id} • {format(new Date(order.createdAt), 'dd MMM yyyy', { locale: fr })}
                          </p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-gray-600">
                        Votre commande attend la confirmation du producteur.
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">Aucune commande en attente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confirmed">
          <Card>
            <CardHeader>
              <CardTitle>Commandes confirmées</CardTitle>
            </CardHeader>
            <CardContent>
              {confirmedOrders.length > 0 ? (
                <div className="space-y-4">
                  {confirmedOrders.map((order: any) => (
                    <div key={order.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{order.product.name}</h3>
                          <p className="text-sm text-gray-600">
                            Commande #{order.id} • {format(new Date(order.createdAt), 'dd MMM yyyy', { locale: fr })}
                          </p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-gray-600">
                        Votre commande a été confirmée et sera bientôt livrée.
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">Aucune commande confirmée</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivered">
          <Card>
            <CardHeader>
              <CardTitle>Commandes livrées</CardTitle>
            </CardHeader>
            <CardContent>
              {deliveredOrders.length > 0 ? (
                <div className="space-y-4">
                  {deliveredOrders.map((order: any) => (
                    <div key={order.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{order.product.name}</h3>
                          <p className="text-sm text-gray-600">
                            Commande #{order.id} • {format(new Date(order.createdAt), 'dd MMM yyyy', { locale: fr })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(order.status)}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReview(order)}
                            className="border-agri-orange text-agri-orange hover:bg-agri-orange hover:text-white"
                          >
                            <Star className="mr-2 h-4 w-4" />
                            Avis
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        Commande livrée avec succès.
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">Aucune commande livrée</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Laisser un avis</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="mb-4">
              <h4 className="font-semibold">{selectedOrder.product.name}</h4>
              <p className="text-sm text-gray-600">
                Producteur: {selectedOrder.farmer.firstName} {selectedOrder.farmer.lastName}
              </p>
            </div>
          )}
          <Form {...reviewForm}>
            <form onSubmit={reviewForm.handleSubmit(onSubmitReview)} className="space-y-4">
              <FormField
                control={reviewForm.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note</FormLabel>
                    <FormControl>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-6 h-6 cursor-pointer ${
                              star <= field.value
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            onClick={() => field.onChange(star)}
                          />
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={reviewForm.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commentaire (optionnel)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Partagez votre expérience..."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-agri-green hover:bg-agri-green/90"
                disabled={reviewMutation.isPending}
              >
                {reviewMutation.isPending ? "Envoi en cours..." : "Publier l'avis"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
