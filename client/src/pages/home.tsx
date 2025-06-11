import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Tractor, ShoppingBasket, Zap, Handshake, Shield, Users, Leaf, Headphones, Star, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ProductCard from "@/components/product-card";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: featuredProducts } = useQuery({
    queryKey: ["/api/products", { limit: 4, approved: true }],
  });

  const { data: provinces } = useQuery({
    queryKey: ["/api/provinces"],
  });

  const handleSearch = () => {
    let searchUrl = "/products";
    const params = new URLSearchParams();
    
    if (searchQuery) params.append("search", searchQuery);
    if (selectedProvince && selectedProvince !== "all") params.append("province", selectedProvince);
    
    if (params.toString()) {
      searchUrl += "?" + params.toString();
    }
    
    window.location.href = searchUrl;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-agri-green to-agri-green-light text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Connectez-vous directement aux producteurs locaux
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Achetez des produits agricoles frais directement auprès des agriculteurs congolais. 
              Vente directe ou mise en relation sécurisée.
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-xl p-2 max-w-2xl mx-auto shadow-xl">
              <div className="flex flex-col md:flex-row gap-2">
                <Input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-gray-700 border-0 focus-visible:ring-agri-orange"
                />
                <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                  <SelectTrigger className="text-gray-700 border-0 focus:ring-agri-orange">
                    <SelectValue placeholder="Toutes les régions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les régions</SelectItem>
                    {provinces?.map((province: string) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleSearch}
                  className="bg-agri-orange hover:bg-agri-orange/90 px-6"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Rechercher
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats?.totalFarmers || 0}+</div>
                <div className="text-sm opacity-80">Agriculteurs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats?.totalProducts || 0}+</div>
                <div className="text-sm opacity-80">Produits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats?.totalProvinces || 0}</div>
                <div className="text-sm opacity-80">Provinces</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Type Selection */}
      <section className="py-16 bg-agri-gray">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Rejoignez notre communauté</h3>
            <p className="text-lg text-gray-600">Choisissez votre rôle et commencez dès aujourd'hui</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Farmer Card */}
            <Card className="hover:shadow-xl transition-all transform hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-agri-green rounded-full flex items-center justify-center mx-auto mb-6">
                  <Tractor className="text-white text-3xl" />
                </div>
                <h4 className="text-2xl font-bold text-gray-800 mb-4">Je suis Agriculteur</h4>
                <p className="text-gray-600 mb-6">
                  Vendez vos produits directement aux consommateurs et développez votre activité
                </p>
                <ul className="text-left text-gray-600 mb-8 space-y-2">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-agri-green rounded-full mr-3"></div>
                    Publiez vos produits facilement
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-agri-green rounded-full mr-3"></div>
                    Fixez vos propres prix
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-agri-green rounded-full mr-3"></div>
                    Gérez vos commandes
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-agri-green rounded-full mr-3"></div>
                    Recevez des évaluations
                  </li>
                </ul>
                <Link href="/register?type=farmer">
                  <Button className="w-full bg-agri-green hover:bg-agri-green/90">
                    Commencer à vendre
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Buyer Card */}
            <Card className="hover:shadow-xl transition-all transform hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-agri-orange rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBasket className="text-white text-3xl" />
                </div>
                <h4 className="text-2xl font-bold text-gray-800 mb-4">Je suis Acheteur</h4>
                <p className="text-gray-600 mb-6">
                  Achetez des produits frais directement auprès des producteurs locaux
                </p>
                <ul className="text-left text-gray-600 mb-8 space-y-2">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-agri-orange rounded-full mr-3"></div>
                    Produits frais et locaux
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-agri-orange rounded-full mr-3"></div>
                    Prix directs producteur
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-agri-orange rounded-full mr-3"></div>
                    Livraison possible
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-agri-orange rounded-full mr-3"></div>
                    Support client
                  </li>
                </ul>
                <Link href="/register?type=buyer">
                  <Button className="w-full bg-agri-orange hover:bg-agri-orange/90">
                    Commencer à acheter
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Produits populaires</h3>
            <p className="text-lg text-gray-600">Découvrez les meilleurs produits de nos agriculteurs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts?.slice(0, 4).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/products">
              <Button className="bg-agri-green hover:bg-agri-green/90">
                Voir tous les produits
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-agri-gray">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Comment ça marche ?</h3>
            <p className="text-lg text-gray-600">Simple, rapide et sécurisé</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-agri-green rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-4">Parcourez les produits</h4>
              <p className="text-gray-600">
                Découvrez une large sélection de produits agricoles frais dans votre région ou ailleurs en RDC.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-agri-orange rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-4">Choisissez votre mode</h4>
              <p className="text-gray-600">
                Achat direct pour une transaction immédiate ou demande de contact pour négocier avec le producteur.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-agri-green-light rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-4">Recevez vos produits</h4>
              <p className="text-gray-600">
                Organisez la livraison ou le retrait avec le producteur. Laissez votre avis pour aider la communauté.
              </p>
            </div>
          </div>

          {/* Sales Modes */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-16">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-agri-green rounded-full flex items-center justify-center mr-4">
                    <Zap className="text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-800">Vente directe</h4>
                </div>
                <p className="text-gray-600 mb-4">
                  Commandez instantanément avec prix fixe. Idéal pour des achats rapides et en confiance.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-agri-green rounded-full mr-3"></div>
                    Transaction immédiate
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-agri-green rounded-full mr-3"></div>
                    Prix fixe transparent
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-agri-green rounded-full mr-3"></div>
                    Moins d'interactions
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-agri-orange rounded-full flex items-center justify-center mr-4">
                    <Handshake className="text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-800">Mise en relation</h4>
                </div>
                <p className="text-gray-600 mb-4">
                  Contactez directement le producteur pour négocier prix, quantité et modalités de livraison.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-agri-orange rounded-full mr-3"></div>
                    Prix négociable
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-agri-orange rounded-full mr-3"></div>
                    Quantités flexibles
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-agri-orange rounded-full mr-3"></div>
                    Relation directe
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Pourquoi nous faire confiance ?</h3>
            <p className="text-lg text-gray-600">Notre engagement envers la qualité et la transparence</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-agri-green rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-white text-2xl" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Sécurisé</h4>
              <p className="text-gray-600 text-sm">Transactions et données protégées</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-agri-orange rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-white text-2xl" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Communauté</h4>
              <p className="text-gray-600 text-sm">Producteurs vérifiés et notés</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-agri-green-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="text-white text-2xl" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Local</h4>
              <p className="text-gray-600 text-sm">Produits 100% congolais</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-agri-orange-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="text-white text-2xl" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Support</h4>
              <p className="text-gray-600 text-sm">Aide 7j/7 via USSD/SMS</p>
            </div>
          </div>
        </div>
      </section>

      {/* USSD Info */}
      <section className="py-16 bg-gradient-to-r from-agri-green to-agri-green-light text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold mb-6">Accès sans Internet ? Pas de problème !</h3>
            <p className="text-lg mb-8 opacity-90">
              Consultez nos produits et contactez les vendeurs directement par USSD, même sans connexion Internet.
            </p>
            
            <div className="bg-white text-gray-800 rounded-xl p-8 mb-8">
              <h4 className="text-xl font-semibold mb-4">Composez simplement :</h4>
              <div className="text-4xl font-bold text-agri-green mb-4">*123*2024#</div>
              <p className="text-gray-600">
                Accédez au menu USSD pour voir les produits par catégorie, par région, et contacter directement les producteurs.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <i className="fas fa-mobile-alt text-3xl mb-4"></i>
                <h4 className="font-semibold mb-2">Menu USSD</h4>
                <p className="text-sm opacity-90">Navigation simple par touches</p>
              </div>
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <i className="fas fa-sms text-3xl mb-4"></i>
                <h4 className="font-semibold mb-2">Notifications SMS</h4>
                <p className="text-sm opacity-90">Alertes sur nouveaux produits</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
