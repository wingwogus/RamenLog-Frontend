import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Phone, Heart } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Restaurant } from "@/services/api";

interface RamenShopCardProps {
  restaurant: Restaurant;
  onRate: (shopId: number, rating: number) => void;
}

const RamenShopCard = ({ restaurant, onRate }: RamenShopCardProps) => {
  const navigate = useNavigate();
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleRating = (rating: number) => {
    setUserRating(rating);
    onRate(restaurant.id, rating);
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-card hover:-translate-y-1">
        <div className="relative overflow-hidden h-48">
          <img 
            src={restaurant.imageUrl} 
            alt={restaurant.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 right-3 flex gap-2">
            {restaurant.isLiked && (
              <Badge variant="secondary" className="bg-red-500/80 text-white backdrop-blur-sm">
                <Heart className="w-3 h-3 mr-1 fill-current" />
                찜
              </Badge>
            )}
          </div>
        </div>
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-foreground line-clamp-1">
            {restaurant.name}
          </h3>
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="font-medium">{restaurant.avgRating.toFixed(1)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{restaurant.address.roadAddr}</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate(`/review/${restaurant.id}`)}
          >
            리뷰 작성
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RamenShopCard;