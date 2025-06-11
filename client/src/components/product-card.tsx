import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin } from "lucide-react";
import { Link } from "wouter";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product & {
    averageRating?: number;
    reviewCount?: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: string) => {
    return `${parseFloat(price).toLocaleString()} FC`;
  };

  const getStatusBadge = () => {
    if (product.saleMode === 'direct') {
      return (
        <Badge className="bg-agri-green text-white">
          Disponible
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-agri-orange text-white">
          Contact
        </Badge>
      );
    }
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

  return (
    <Card className="hover:shadow-xl transition-all transform hover:-translate-y-1">
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img 
              src={product.images[0]} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              Aucune image
            </div>
          )}
        </div>

        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-800 truncate">{product.name}</h4>
            {getStatusBadge()}
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description || "Description non disponible"}
          </p>

          {/* Price and Quantity */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-agri-orange">
              {formatPrice(product.price)}/{product.unit}
            </span>
            <span className="text-sm text-gray-500">
              {product.availableQuantity}{product.unit} disponible
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center mb-3">
            <MapPin className="w-4 h-4 text-gray-400 mr-1" />
            <span className="text-sm text-gray-600 truncate">
              {product.location}, {product.province}
            </span>
          </div>

          {/* Rating */}
          {product.averageRating && product.averageRating > 0 && (
            <div className="flex items-center mb-4">
              <div className="flex mr-2">
                {renderStars(product.averageRating)}
              </div>
              <span className="text-sm text-gray-600">
                {product.averageRating.toFixed(1)} ({product.reviewCount || 0} avis)
              </span>
            </div>
          )}

          {/* Action Button */}
          <Link href={`/products/${product.id}`}>
            <Button className="w-full bg-agri-green hover:bg-agri-green/90">
              {product.saleMode === 'direct' ? 'Voir détails' : 'Contacter vendeur'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
