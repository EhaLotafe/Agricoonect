import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, ShoppingCart, MessageCircle, Plus, Edit, Trash2, Eye, MapPin } from "lucide-react";
import { useAuth } from "@/App";
import ProductForm from "@/components/product-form";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import type { Product } from "@shared/schema";

export default function FarmerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [showProductForm, setShowProductForm] = useState(false);

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: [`/api/farmer/${user?.id}/products`],
    enabled: !!user,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: [`/api/farmer/${user?.id}/orders`],
    enabled: !!user,
  });

  const { data: contacts, isLoading: contactsLoading } = useQuery({
    queryKey: [`/api/farmer/${user?.id}/contacts`],
    enabled: !!user,
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      return await apiRequest('DELETE', `/api/products/${productId}`);
    },
    onSuccess: () => {
      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/farmer/${user?.id}/products`] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      return await apiRequest('PUT', `/api/orders/${orderId}`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Commande mise à jour",
        description: "Le statut de la commande a été mis à jour",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/farmer/${user?.id}/orders`] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: async ({ contactId, status }: { contactId: number; status: string }) => {
      return await apiRequest('PUT', `/api/contacts/${contactId}`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Contact mis à jour",
        description: "Le statut du contact a été mis à jour",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/farmer/${user?.id}/contacts`] });
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
      contacted: { label: "Contacté", className: "bg-blue-500" },
      completed: { label: "Terminé", className: "bg-agri-green" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: "bg-gray-500" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowProductForm(true);
  };

  const handleAddProduct = () => {
    setSelectedProduct(undefined);
    setShowProductForm(true);
  };

  const handleFormSuccess = () => {
    setShowProductForm(false);
    setSelectedProduct(undefined);
  };

  const activeProducts = products?.filter((p: Product) => p.isActive) || [];
  const pendingOrders = orders?.filter((o: any) => o.status === 'pending') || [];
  const pendingContacts = contacts?.filter((c: any) => c.status === 'pending') || [];

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Accès non autorisé
            </h3>
            <p className="text-gray-600">
              Vous devez être connecté en tant qu'agriculteur pour accéder à cette page.
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
          Tableau de bord - Agriculteur
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
              <Package className="h-8 w-8 text-agri-green" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Produits actifs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeProducts.length}
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
                <p className="text-sm font-medium text-gray-600">Commandes en attente</p>
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
              <MessageCircle className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Messages en attente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingContacts.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total ventes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders?.filter((o: any) => o.status === 'delivered').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Mes Produits</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="contacts">Messages</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Mes Produits</CardTitle>
                <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAddProduct} className="bg-agri-green hover:bg-agri-green/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter un produit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedProduct ? "Modifier le produit" : "Ajouter un nouveau produit"}
                      </DialogTitle>
                    </DialogHeader>
                    <ProductForm product={selectedProduct} onSuccess={handleFormSuccess} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : products && products.length > 0 ? (
                <div className="space-y-4">
                  {products.map((product: Product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{product.name}</h3>
                          {getStatusBadge(product.isActive ? 'active' : 'inactive')}
                          {!product.isApproved && (
                            <Badge variant="outline">En attente d'approbation</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{formatPrice(product.price)}/{product.unit}</span>
                          <span>{product.availableQuantity} {product.unit} disponible</span>
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {product.location}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteProductMutation.mutate(product.id)}
                          disabled={deleteProductMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Aucun produit
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Vous n'avez pas encore ajouté de produits.
                  </p>
                  <Button onClick={handleAddProduct} className="bg-agri-green hover:bg-agri-green/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter votre premier produit
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Commandes reçues</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Client</p>
                          <p className="font-medium">{order.buyer.firstName} {order.buyer.lastName}</p>
                          {order.buyer.phone && (
                            <p className="text-sm text-gray-600">{order.buyer.phone}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Quantité</p>
                          <p className="font-medium">{order.quantity} {order.product.unit}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total</p>
                          <p className="font-medium">{formatPrice(order.totalPrice)}</p>
                        </div>
                      </div>

                      {order.deliveryAddress && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600">Adresse de livraison</p>
                          <p className="text-sm">{order.deliveryAddress}</p>
                        </div>
                      )}

                      {order.notes && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600">Notes</p>
                          <p className="text-sm">{order.notes}</p>
                        </div>
                      )}

                      {order.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-agri-green hover:bg-agri-green/90"
                            onClick={() => updateOrderMutation.mutate({ orderId: order.id, status: 'confirmed' })}
                            disabled={updateOrderMutation.isPending}
                          >
                            Confirmer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateOrderMutation.mutate({ orderId: order.id, status: 'cancelled' })}
                            disabled={updateOrderMutation.isPending}
                          >
                            Annuler
                          </Button>
                        </div>
                      )}

                      {order.status === 'confirmed' && (
                        <Button
                          size="sm"
                          className="bg-agri-green hover:bg-agri-green/90"
                          onClick={() => updateOrderMutation.mutate({ orderId: order.id, status: 'delivered' })}
                          disabled={updateOrderMutation.isPending}
                        >
                          Marquer comme livré
                        </Button>
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
                  <p className="text-gray-600">
                    Vous n'avez pas encore reçu de commandes.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle>Messages des clients</CardTitle>
            </CardHeader>
            <CardContent>
              {contactsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : contacts && contacts.length > 0 ? (
                <div className="space-y-4">
                  {contacts.map((contact: any) => (
                    <div key={contact.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{contact.product.name}</h3>
                          <p className="text-sm text-gray-600">
                            De: {contact.buyer.firstName} {contact.buyer.lastName} • 
                            {format(new Date(contact.createdAt), 'dd MMM yyyy', { locale: fr })}
                          </p>
                        </div>
                        {getStatusBadge(contact.status)}
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-600">Message</p>
                        <p className="text-sm bg-gray-50 p-3 rounded">{contact.message}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Email du client</p>
                          <p className="font-medium">{contact.buyer.email}</p>
                        </div>
                        {contact.buyerPhone && (
                          <div>
                            <p className="text-sm text-gray-600">Téléphone</p>
                            <p className="font-medium">{contact.buyerPhone}</p>
                          </div>
                        )}
                      </div>

                      {contact.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-agri-orange hover:bg-agri-orange/90"
                            onClick={() => updateContactMutation.mutate({ contactId: contact.id, status: 'contacted' })}
                            disabled={updateContactMutation.isPending}
                          >
                            Marquer comme contacté
                          </Button>
                        </div>
                      )}

                      {contact.status === 'contacted' && (
                        <Button
                          size="sm"
                          className="bg-agri-green hover:bg-agri-green/90"
                          onClick={() => updateContactMutation.mutate({ contactId: contact.id, status: 'completed' })}
                          disabled={updateContactMutation.isPending}
                        >
                          Marquer comme terminé
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Aucun message
                  </h3>
                  <p className="text-gray-600">
                    Vous n'avez pas encore reçu de messages de clients.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
