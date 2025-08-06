import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Phone, Heart } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Restaurant, apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface RamenShopCardProps {
  restaurant: Restaurant;
  onRate: (shopId: number, rating: number) => void;
  onLikeToggle?: () => void;
}

const RamenShopCard = ({ restaurant, onRate, onLikeToggle }: RamenShopCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isLiked, setIsLiked] = useState(restaurant.isLiked || false);
  const [isLiking, setIsLiking] = useState(false);

  const handleRating = (rating: number) => {
    setUserRating(rating);
    onRate(restaurant.id, rating);
  };

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    setIsLiking(true);
    try {
      const response = await apiService.toggleLike(restaurant.id);
      if (response.success) {
        setIsLiked(response.data);
        onLikeToggle?.();
        toast.success(response.data ? "찜 목록에 추가되었습니다" : "찜 목록에서 제거되었습니다");
      } else {
        toast.error("오류가 발생했습니다");
      }
    } catch (error) {
      toast.error("오류가 발생했습니다");
    } finally {
      setIsLiking(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/restaurant/${restaurant.id}`);
  };

  return (
    <Card 
      className="group overflow-hidden transition-all duration-300 hover:shadow-card hover:-translate-y-1 cursor-pointer"
      onClick={handleCardClick}
    >
        <div className="relative overflow-hidden h-48">
          <img 
            src={restaurant.imageUrl} 
            alt={restaurant.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              size="sm"
              variant={isLiked ? "default" : "secondary"}
              onClick={handleLikeToggle}
              disabled={isLiking}
              className={`backdrop-blur-sm ${
                isLiked 
                  ? "bg-red-500/90 hover:bg-red-600/90 text-white" 
                  : "bg-white/90 hover:bg-white text-gray-700"
              }`}
            >
              <Heart className={`w-3 h-3 mr-1 ${isLiked ? "fill-current" : ""}`} />
              {isLiked ? "찜" : "찜"}
            </Button>
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
            <span className="line-clamp-1">{restaurant.address.fullAddress}</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/review/${restaurant.id}`);
            }}
          >
            리뷰 작성
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RamenShopCard;