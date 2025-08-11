import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService, Restaurant, Review } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Star, MapPin, Heart, MessageSquare, Phone, Clock, X } from 'lucide-react';
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

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const openPreview = (src: string) => {
    setActiveImage(src);
    setIsPreviewOpen(true);
  };
  const closePreview = () => {
    setIsPreviewOpen(false);
    setActiveImage(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePreview();
    };

    if (isPreviewOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', onKey);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isPreviewOpen]);

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
          setIsLiked(restaurantResponse.data.liked || false);
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

    // Optimistic update - toggle immediately on frontend
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);

    setIsLiking(true);
    try {
      await apiService.toggleLike(restaurant.id);
      toast.success(newLikedState ? "찜 목록에 추가되었습니다" : "찜 목록에서 제거되었습니다");
    } catch (error) {
      // Revert on error
      setIsLiked(isLiked);
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
            onClick={() => navigate(-1)}
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
                variant="ghost"
                onClick={handleLikeToggle}
                disabled={isLiking}
                className="backdrop-blur-sm bg-white/90 hover:bg-white"
              >
                <Heart className={`w-5 h-5 mr-2 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
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
                      {renderStars(restaurant.avgRating ?? 0)}
                      <span className="ml-1 font-medium">{(restaurant.avgRating ?? 0).toFixed(1)}</span>
                    </div>
                    <span className="text-muted-foreground">
                      ({reviews.length}개 리뷰)
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <span>{restaurant.address.fullAddress}</span>
                  {typeof restaurant.openNow === 'boolean' && (
                    <Badge variant="secondary" className={restaurant.openNow ? 'bg-green-500/10 text-green-600 border-green-500/20' : ''}>
                      {restaurant.openNow ? '영업중' : '영업 종료'}
                    </Badge>
                  )}
                </div>
                {restaurant.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <a href={`tel:${restaurant.phoneNumber}`} className="hover:underline">
                      {restaurant.phoneNumber}
                    </a>
                  </div>
                )}
                {restaurant.weekdayText && restaurant.weekdayText.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      {restaurant.weekdayText.map((line, idx) => (
                        <div key={idx} className="text-sm text-muted-foreground">{line}</div>
                      ))}
                    </div>
                  </div>
                )}
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
                            {renderStars(review.rating ?? 0)}
                            <span className="text-sm text-muted-foreground ml-1">
                              {(review.rating ?? 0).toFixed(1)}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {review.createdAt ? formatDate(review.createdAt) : ''}
                          </span>
                        </div>

                        <p className="text-foreground leading-relaxed">
                          {review.content}
                        </p>

                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {review.images.map((image, imgIndex) => (
                              <div
                                key={imgIndex}
                                className="w-20 h-20 rounded-lg overflow-hidden cursor-zoom-in group"
                                role="button"
                                tabIndex={0}
                                aria-label={`리뷰 이미지 ${imgIndex + 1} 확대`}
                                onClick={() => openPreview(image)}
                                onKeyDown={(e) => { if (e.key === 'Enter') openPreview(image); }}
                              >
                                <img
                                  src={image}
                                  alt={`리뷰 이미지 ${imgIndex + 1}`}
                                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                                />
                              </div>
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
      {isPreviewOpen && activeImage && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closePreview}
          aria-modal="true"
          role="dialog"
        >
          <div className="relative max-w-[90vw] max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={activeImage}
              alt="확대 이미지"
              className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-2xl object-contain"
            />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute -top-3 -right-3 rounded-full shadow"
              onClick={closePreview}
              aria-label="확대 닫기"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetailPage;