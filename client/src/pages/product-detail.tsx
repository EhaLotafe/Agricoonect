import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Star, MapPin, Phone, User, Package, MessageCircle, ShoppingCart } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/App";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const orderSchema = z.object({
  quantity: z.number().min(1, "La quantité doit être d'au moins 1"),
  deliveryAddress: z.string().optional(),
  notes: z.string().optional(),
});

const contactSchema = z.object({
  message: z.string().min(1, "Le message est requis"),
  buyerPhone: z.string().optional(),
});

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;
type ContactFormData = z.infer<typeof contactSchema>;
type ReviewFormData = z.infer<typeof reviewSchema>;

export default function ProductDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: [`/api/products/${id}`],
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: [`/api/products/${id}/reviews`],
    enabled: !!id,
  });

  const { data: rating } = useQuery({
    queryKey: [`/api/products/${id}/rating`],
    enabled: !!id,
  });

  const orderForm = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      quantity: 1,
      deliveryAddress: '',
      notes: '',
    },
  });

  const contactForm = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      message: '',
      buyerPhone: '',
    },
  });

  const reviewForm = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: '',
    },
  });

  const orderMutation = useMutation({
    mutationFn: async (data: OrderFormData) => {
      if (!user || !product) throw new Error("User or product not found");
      
      const orderData = {
        buyerId: user.id,
        productId: product.id,
        farmerId: product.farmerId,
        quantity: data.quantity,
        totalPrice: (parseFloat(product.price) * data.quantity).toString(),
        deliveryAddress: data.deliveryAddress,
        notes: data.notes,
      };

      return await apiRequest('POST', '/api/orders', orderData);
    },
    onSuccess: () => {
      toast({
        title: "Commande passée",
        description: "Votre commande a été passée avec succès!",
      });
      setShowOrderDialog(false);
      queryClient.invalidateQueries({ queryKey: [`/api/products/${id}`] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      if (!user || !product) throw new Error("User or product not found");
      
      const contactData = {
        buyerId: user.id,
        productId: product.id,
        farmerId: product.farmerId,
        message: data.message,
        buyerPhone: data.buyerPhone,
      };

      return await apiRequest('POST', '/api/contacts', contactData);
    },
    onSuccess: () => {
      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé au producteur!",
      });
      setShowContactDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      if (!user || !product) throw new Error("User or product not found");
      
      const reviewData = {
        buyerId: user.id,
        productId: product.id,
        farmerId: product.farmerId,
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
      queryClient.invalidateQueries({ queryKey: [`/api/products/${id}/reviews`] });
      queryClient.invalidateQueries({ queryKey: [`/api/products/${id}/rating`] });
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

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-12 text-center">
          <CardContent>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Produit non trouvé
            </h3>
            <p className="text-gray-600">
              Le produit que vous recherchez n'existe pas ou a été supprimé.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <div className="h-96 bg-gray-200 rounded-lg overflow-hidden mb-4">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[0]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                Aucune image disponible
              </div>
            )}
          </div>
          
          {/* Additional Images */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((image, index) => (
                <div key={index} className="h-20 bg-gray-200 rounded overflow-hidden">
                  <img 
                    src={image} 
                    alt={`${product.name} ${index + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
            <Badge className={product.saleMode === 'direct' ? 'bg-agri-green' : 'bg-agri-orange'}>
              {product.saleMode === 'direct' ? 'Vente directe' : 'Mise en relation'}
            </Badge>
          </div>

          <div className="flex items-center mb-4">
            <MapPin className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-gray-600">{product.location}, {product.province}</span>
          </div>

          <div className="flex items-center mb-4">
            <Package className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-gray-600">Catégorie: {product.category}</span>
          </div>

          {rating && rating.rating > 0 && (
            <div className="flex items-center mb-4">
              <div className="flex mr-2">
                {renderStars(rating.rating)}
              </div>
              <span className="text-gray-600">
                {rating.rating.toFixed(1)} ({reviews?.length || 0} avis)
              </span>
            </div>
          )}

          <div className="text-3xl font-bold text-agri-orange mb-4">
            {formatPrice(product.price)}/{product.unit}
          </div>

          <div className="mb-4">
            <span className="text-gray-600">
              Quantité disponible: {product.availableQuantity} {product.unit}
            </span>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600">
              {product.description || "Aucune description disponible"}
            </p>
          </div>

          {/* Action Buttons */}
          {isAuthenticated && user?.userType === 'buyer' && (
            <div className="space-y-3 mb-6">
              {product.saleMode === 'direct' ? (
                <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-agri-green hover:bg-agri-green/90">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Commander maintenant
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Passer commande</DialogTitle>
                    </DialogHeader>
                    <Form {...orderForm}>
                      <form onSubmit={orderForm.handleSubmit((data) => orderMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={orderForm.control}
                          name="quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantité ({product.unit})</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max={product.availableQuantity}
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="text-lg font-semibold">
                          Total: {formatPrice((parseFloat(product.price) * (orderForm.watch('quantity') || 1)).toString())}
                        </div>

                        <FormField
                          control={orderForm.control}
                          name="deliveryAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Adresse de livraison (optionnel)</FormLabel>
                              <FormControl>
                                <Textarea {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={orderForm.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes (optionnel)</FormLabel>
                              <FormControl>
                                <Textarea {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          className="w-full bg-agri-green hover:bg-agri-green/90"
                          disabled={orderMutation.isPending}
                        >
                          {orderMutation.isPending ? "Commande en cours..." : "Confirmer la commande"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              ) : (
                <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-agri-orange hover:bg-agri-orange/90">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Contacter le vendeur
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Contacter le vendeur</DialogTitle>
                    </DialogHeader>
                    <Form {...contactForm}>
                      <form onSubmit={contactForm.handleSubmit((data) => contactMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={contactForm.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Décrivez votre demande..."
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={contactForm.control}
                          name="buyerPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Votre téléphone (optionnel)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="+243 XXX XXX XXX"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          className="w-full bg-agri-orange hover:bg-agri-orange/90"
                          disabled={contactMutation.isPending}
                        >
                          {contactMutation.isPending ? "Envoi en cours..." : "Envoyer le message"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}

              <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Star className="mr-2 h-4 w-4" />
                    Laisser un avis
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Laisser un avis</DialogTitle>
                  </DialogHeader>
                  <Form {...reviewForm}>
                    <form onSubmit={reviewForm.handleSubmit((data) => reviewMutation.mutate(data))} className="space-y-4">
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
          )}

          {!isAuthenticated && (
            <div className="bg-agri-gray p-4 rounded-lg text-center">
              <p className="text-gray-600 mb-2">
                Connectez-vous pour commander ce produit
              </p>
              <Button asChild className="bg-agri-green hover:bg-agri-green/90">
                <a href="/login">Se connecter</a>
              </Button>
            </div>
          )}

          {/* Farmer Information */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Informations du vendeur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Nom:</strong> {product.farmer?.firstName} {product.farmer?.lastName}</p>
                {product.farmer?.phone && (
                  <p className="flex items-center">
                    <Phone className="mr-2 h-4 w-4" />
                    {product.farmer.phone}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reviews Section */}
      {reviews && reviews.length > 0 && (
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-6">Avis des clients</h3>
          <div className="space-y-4">
            {reviews.map((review: any) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center mb-1">
                        <div className="flex mr-2">
                          {renderStars(review.rating)}
                        </div>
                        <span className="font-semibold">
                          {review.buyer.firstName} {review.buyer.lastName}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {format(new Date(review.createdAt), 'dd MMMM yyyy', { locale: fr })}
                      </span>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 mt-2">{review.comment}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
