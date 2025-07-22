import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Phone } from "lucide-react";
import { useState } from "react";

interface RamenShop {
  id: number;
  name: string;
  address: string;
  phone: string;
  openHours: string;
  rating: number;
  ratingCount: number;
  category: string;
  specialties: string[];
  image: string;
  priceRange: string;
}

interface RamenShopCardProps {
  shop: RamenShop;
  onRate: (shopId: number, rating: number) => void;
}

const RamenShopCard = ({ shop, onRate }: RamenShopCardProps) => {
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleRating = (rating: number) => {
    setUserRating(rating);
    onRate(shop.id, rating);
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-card hover:-translate-y-1">
      <div className="relative overflow-hidden h-48">
        <img 
          src={shop.image} 
          alt={shop.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm">
            {shop.category}
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-gradient-primary text-primary-foreground">
            {shop.priceRange}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-foreground line-clamp-1">
            {shop.name}
          </h3>
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="font-medium">{shop.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({shop.ratingCount})</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{shop.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{shop.openHours}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>{shop.phone}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {shop.specialties.map((specialty, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {specialty}
            </Badge>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">내 평점</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleRating(star)}
                  className="p-1 rounded-full hover:bg-secondary transition-colors"
                >
                  <Star 
                    className={`w-4 h-4 transition-colors ${
                      star <= (hoverRating || userRating)
                        ? 'fill-accent text-accent' 
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <Button variant="outline" className="w-full">
            상세보기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RamenShopCard;