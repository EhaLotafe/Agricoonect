import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Package, ShoppingCart, BarChart3, Check, X, Eye } from "lucide-react";
import { useAuth } from "@/App";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
  });

  const { data: users } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  const { data: products } = useQuery({
    queryKey: ['/api/admin/products'],
  });

  const approveProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      return await apiRequest('PUT', `/api/admin/products/${productId}/approve`);
    },
    onSuccess: () => {
      toast({
        title: "Produit approuvé",
        description: "Le produit a été approuvé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
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

  const getUserTypeBadge = (userType: string) => {
    const config = {
      farmer: { label: "Agriculteur", className: "bg-agri-green" },
      buyer: { label: "Acheteur", className: "bg-agri-orange" },
      admin: { label: "Admin", className: "bg-blue-500" },
    };

    const typeConfig = config[userType as keyof typeof config] || { label: userType, className: "bg-gray-500" };
    return <Badge className={typeConfig.className}>{typeConfig.label}</Badge>;
  };

  const getApprovalBadge = (isApproved: boolean) => {
    return isApproved ? (
      <Badge className="bg-agri-green">Approuvé</Badge>
    ) : (
      <Badge variant="outline">En attente</Badge>
    );
  };

  if (!user || user.userType !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Accès non autorisé
            </h3>
            <p className="text-gray-600">
              Vous devez être administrateur pour accéder à cette page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const farmers = users?.filter((u: any) => u.userType === 'farmer') || [];
  const buyers = users?.filter((u: any) => u.userType === 'buyer') || [];
  const pendingProducts = products?.filter((p: any) => !p.isApproved) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Administration
        </h1>
        <p className="text-gray-600">
          Tableau de bord administrateur - Agri-Connect RDC
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-agri-green" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Agriculteurs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalFarmers || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-agri-orange" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Produits actifs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalProducts || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Commandes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalOrders || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Provinces</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalProvinces || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="pending">
            En attente d'approbation
            {pendingProducts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingProducts.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des utilisateurs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Agriculteurs</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-agri-green h-2 rounded-full" 
                          style={{ width: `${((farmers.length / (users?.length || 1)) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{farmers.length}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Acheteurs</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-agri-orange h-2 rounded-full" 
                          style={{ width: `${((buyers.length / (users?.length || 1)) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{buyers.length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => document.querySelector('[data-value="pending"]')?.click()}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Approuver les produits ({pendingProducts.length})
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => document.querySelector('[data-value="users"]')?.click()}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Gérer les utilisateurs
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => document.querySelector('[data-value="products"]')?.click()}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Voir tous les produits
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              {users && users.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Localisation</TableHead>
                      <TableHead>Date d'inscription</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {getUserTypeBadge(user.userType)}
                        </TableCell>
                        <TableCell>{user.location || '-'}</TableCell>
                        <TableCell>
                          {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: fr })}
                        </TableCell>
                        <TableCell>
                          <Badge className={user.isActive ? 'bg-agri-green' : 'bg-gray-500'}>
                            {user.isActive ? 'Actif' : 'Inactif'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Aucun utilisateur
                  </h3>
                  <p className="text-gray-600">
                    Aucun utilisateur enregistré pour le moment.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Tous les produits</CardTitle>
            </CardHeader>
            <CardContent>
              {products && products.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Prix</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead>Localisation</TableHead>
                      <TableHead>Date de création</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product: any) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          {formatPrice(product.price)}/{product.unit}
                        </TableCell>
                        <TableCell>
                          {product.availableQuantity} {product.unit}
                        </TableCell>
                        <TableCell>
                          {product.location}, {product.province}
                        </TableCell>
                        <TableCell>
                          {format(new Date(product.createdAt), 'dd MMM yyyy', { locale: fr })}
                        </TableCell>
                        <TableCell>
                          {getApprovalBadge(product.isApproved)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Aucun produit
                  </h3>
                  <p className="text-gray-600">
                    Aucun produit enregistré pour le moment.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Approval Tab */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Produits en attente d'approbation</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingProducts.length > 0 ? (
                <div className="space-y-4">
                  {pendingProducts.map((product: any) => (
                    <div key={product.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-gray-600">
                            {product.category} • {formatPrice(product.price)}/{product.unit}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="bg-agri-green hover:bg-agri-green/90"
                            onClick={() => approveProductMutation.mutate(product.id)}
                            disabled={approveProductMutation.isPending}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled
                          >
                            <X className="mr-2 h-4 w-4" />
                            Rejeter
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Description</p>
                          <p>{product.description || 'Aucune description'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Quantité disponible</p>
                          <p>{product.availableQuantity} {product.unit}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Localisation</p>
                          <p>{product.location}, {product.province}</p>
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-gray-600">
                        <p>
                          Soumis le {format(new Date(product.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Check className="mx-auto h-12 w-12 text-agri-green mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Aucun produit en attente
                  </h3>
                  <p className="text-gray-600">
                    Tous les produits soumis ont été traités.
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
