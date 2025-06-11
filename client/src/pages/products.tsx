import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter } from "lucide-react";
import ProductCard from "@/components/product-card";
import { useLocation } from "wouter";

export default function Products() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  
  const [filters, setFilters] = useState({
    search: urlParams.get('search') || '',
    category: urlParams.get('category') || '',
    province: urlParams.get('province') || '',
    saleMode: urlParams.get('saleMode') || '',
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products', filters],
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: provinces } = useQuery({
    queryKey: ['/api/provinces'],
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      province: 'all', 
      saleMode: 'all',
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => value !== '' && value !== 'all').length;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Skeleton */}
          <div className="lg:col-span-1">
            <Skeleton className="h-96 w-full" />
          </div>
          
          {/* Products Skeleton */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-96 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Produits Agricoles</h1>
        <p className="text-gray-600">
          Découvrez {Array.isArray(products) ? products.length : 0} produits frais de nos agriculteurs locaux
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  Filtres
                </div>
                {activeFiltersCount > 0 && (
                  <Badge variant="outline">
                    {activeFiltersCount}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search */}
              <div>
                <label className="text-sm font-medium mb-2 block">Rechercher</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Nom du produit..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium mb-2 block">Catégorie</label>
                <Select 
                  value={filters.category} 
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {Array.isArray(categories) && categories.map((category: string) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Province */}
              <div>
                <label className="text-sm font-medium mb-2 block">Province</label>
                <Select 
                  value={filters.province} 
                  onValueChange={(value) => handleFilterChange('province', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les provinces" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les provinces</SelectItem>
                    {Array.isArray(provinces) && provinces.map((province: string) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sale Mode */}
              <div>
                <label className="text-sm font-medium mb-2 block">Mode de vente</label>
                <Select 
                  value={filters.saleMode} 
                  onValueChange={(value) => handleFilterChange('saleMode', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les modes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les modes</SelectItem>
                    <SelectItem value="direct">Vente directe</SelectItem>
                    <SelectItem value="contact">Mise en relation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="w-full"
                >
                  Effacer les filtres
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {Array.isArray(products) && products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <CardContent>
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Aucun produit trouvé
                </h3>
                <p className="text-gray-600 mb-4">
                  Essayez de modifier vos critères de recherche ou explorez d'autres catégories.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Voir tous les produits
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
