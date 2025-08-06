import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService, Restaurant, Review } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Star, MapPin, Heart, MessageSquare, Phone, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const RestaurantDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);

      try {
        const [restaurantResponse, reviewsResponse] = await Promise.all([
          apiService.getRestaurant(Number(id)),
          apiService.getRestaurantReviews(Number(id))
        ]);

        if (restaurantResponse.success) {
          setRestaurant(restaurantResponse.data);
          setIsLiked(restaurantResponse.data.isLiked || false);
        } else {
          setError(restaurantResponse.error || '라멘집 정보를 불러오는데 실패했습니다.');
        }

        if (reviewsResponse.success) {
          setReviews(reviewsResponse.data);
        }
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleLikeToggle = async () => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    if (!restaurant) return;

    setIsLiking(true);
    try {
      const response = await apiService.toggleLike(restaurant.id);
      if (response.success) {
        setIsLiked(response.data);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : i < rating 
              ? 'fill-yellow-200 text-yellow-400' 
              : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-destructive">{error || '라멘집 정보를 찾을 수 없습니다.'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">라멘집 상세</h1>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Restaurant Info */}
        <Card>
          <div className="relative h-64 overflow-hidden rounded-t-lg">
            <img 
              src={restaurant.imageUrl} 
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4">
              <Button
                variant={isLiked ? "default" : "secondary"}
                onClick={handleLikeToggle}
                disabled={isLiking}
                className={`backdrop-blur-sm ${
                  isLiked 
                    ? "bg-red-500/90 hover:bg-red-600/90 text-white" 
                    : "bg-white/90 hover:bg-white text-gray-700"
                }`}
              >
                <Heart className={`w-4 h-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                {isLiked ? "찜 완료" : "찜하기"}
              </Button>
            </div>
          </div>

          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold">{restaurant.name}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      {renderStars(restaurant.avgRating)}
                      <span className="ml-1 font-medium">{restaurant.avgRating.toFixed(1)}</span>
                    </div>
                    <span className="text-muted-foreground">
                      ({reviews.length}개 리뷰)
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <span>{restaurant.address.fullAddress}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  className="flex-1"
                  onClick={() => navigate(`/review/${restaurant.id}`)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  리뷰 작성
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              리뷰 ({reviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                아직 작성된 리뷰가 없습니다.
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {review.nickname.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.nickname}</span>
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                            <span className="text-sm text-muted-foreground ml-1">
                              {review.rating.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        
                        <p className="text-foreground leading-relaxed">
                          {review.content}
                        </p>

                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {review.images.map((image, imgIndex) => (
                              <img
                                key={imgIndex}
                                src={image}
                                alt={`리뷰 이미지 ${imgIndex + 1}`}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {index < reviews.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RestaurantDetailPage;